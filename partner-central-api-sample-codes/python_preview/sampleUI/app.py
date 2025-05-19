#!/usr/bin/env python

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""
Purpose:
Web UI for Partner Central API with Cognito Authentication
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
import logging
import os
import boto3
import requests
import urllib.parse
import uuid
import get_opportunity
import list_opportunities_noPaging
import list_solutions
import list_engagement_invitations
import get_engagement_invitation
import create_opportunity_api
import create_aws_opportunity_api
import associate_opportunity_api
import start_engagement_from_opportunity_api
import simulate_approval_api
import simulate_action_required_api
import socket
import start_engagement_by_accepting_invitation_task
import update_opportunity_stage_api
from utils.helpers import DateTimeEncoder
from functools import wraps

# Create logs directory
os.makedirs('logs', exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)

# Configure logger
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', uuid.uuid4().hex)

# Try to detect if running on EC2 by checking hostname
try:
    hostname = socket.gethostname()
    is_ec2 = 'ec2' in hostname or 'ip-' in hostname
except:
    is_ec2 = False

# Set environment based on detection or override with env var
ENV = os.environ.get('DEPLOYMENT_ENV', 'ec2' if is_ec2 else 'local')

# Set URLs based on environment
if ENV == 'ec2':
    try:
        # Try to get public hostname from EC2 metadata service
        response = requests.get('http://169.254.169.254/latest/meta-data/public-hostname', timeout=0.5)
        if response.status_code == 200:
            ec2_hostname = response.text
            BASE_URL = f'http://{ec2_hostname}'
        else:
            # Fallback to public IPv4
            response = requests.get('http://169.254.169.254/latest/meta-data/public-ipv4', timeout=0.5)
            if response.status_code == 200:
                ec2_ip = response.text
                BASE_URL = f'http://{ec2_ip}'
            else:
                # Final fallback
                BASE_URL = 'http://localhost'
    except Exception as e:
        logger.warning(f"Could not get EC2 metadata: {str(e)}")
        BASE_URL = 'http://localhost'
else:
    BASE_URL = 'http://localhost:8800'

logger.info(f"Using BASE_URL: {BASE_URL}")
REDIRECT_URI = f'{BASE_URL}/callback'

# Cognito configuration
USER_POOL_ID = 'us-east-1_daXTsClRy'
CLIENT_ID = '7tep9c1o3lhl4k6stm6rjf0vjg'
REGION = 'us-east-1'
COGNITO_DOMAIN = f'https://{USER_POOL_ID}.auth.{REGION}.amazoncognito.com'

# Authentication decorator
def cognito_auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'id_token' not in session:
            # Store the requested URL for redirection after authentication
            session['next_url'] = request.url
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

@app.route('/login')
def login():
    """Handle user login with Cognito"""
    # If user is already authenticated, redirect to index
    if 'id_token' in session:
        return redirect(url_for('index'))
    
    # Always use direct login
    return redirect(url_for('direct_login'))

# Complete the logout function
@app.route('/logout')
def logout():
    """Log out the user by clearing their session"""
    # Clear all session data
    session.clear()
    
    # Redirect to login page
    return redirect(url_for('direct_login'))

@app.route('/callback')
def callback():
    """Handle the callback from Cognito authentication"""
    # Verify state parameter
    if request.args.get('state') != session.get('oauth_state'):
        return "Invalid state parameter", 400
    
    # Exchange authorization code for tokens
    code = request.args.get('code')
    if not code:
        return "No authorization code received", 400
    
    token_url = f'{COGNITO_DOMAIN}/oauth2/token'
    token_params = {
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'code': code,
        'redirect_uri': REDIRECT_URI
    }
    
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    try:
        response = requests.post(token_url, data=token_params, headers=headers)
        response.raise_for_status()
        tokens = response.json()
        
        # Store tokens in session
        session['access_token'] = tokens['access_token']
        session['id_token'] = tokens['id_token']
        session['refresh_token'] = tokens.get('refresh_token')
        
        # Get user info
        userinfo_url = f'{COGNITO_DOMAIN}/oauth2/userInfo'
        userinfo_headers = {'Authorization': f'Bearer {tokens["access_token"]}'}
        userinfo_response = requests.get(userinfo_url, headers=userinfo_headers)
        userinfo_response.raise_for_status()
        user_info = userinfo_response.json()
        
        # Store user info in session
        session['user_email'] = user_info.get('email')
        session['user_name'] = user_info.get('name', user_info.get('email'))
        
        # Redirect to the originally requested URL or AWS credentials page
        next_url = session.pop('next_url', url_for('aws_credentials'))
        return redirect(next_url)
    except Exception as e:
        logger.error(f"Error exchanging code for tokens: {str(e)}")
        return f"Authentication error: {str(e)}", 500

@app.route('/aws_credentials', methods=['GET', 'POST'])
@cognito_auth_required
def aws_credentials():
    """Handle AWS credentials input"""
    error = None
    if request.method == 'POST':
        # Check if user clicked "Skip Login"
        if 'skip' in request.form:
            # Clear any existing credentials
            session.pop('aws_access_key', None)
            session.pop('aws_secret_key', None)
            session.pop('aws_session_token', None)
            session.pop('aws_region', None)
            session['aws_region'] = request.form.get('region', 'us-east-1').strip()
            session['skipped_login'] = True
            return redirect(url_for('index'))
        
        # Store credentials in session
        access_key = request.form.get('access_key', '').strip()
        secret_key = request.form.get('secret_key', '').strip()
        session_token = request.form.get('session_token', '').strip()
        region = request.form.get('region', 'us-east-1').strip()
        
        # If access key is provided, validate the credentials
        if access_key and secret_key:
            session['aws_access_key'] = access_key
            session['aws_secret_key'] = secret_key
            session['aws_session_token'] = session_token
            session['aws_region'] = region
            
            # Try to validate credentials by making a simple API call
            try:
                client_kwargs = {
                    'service_name': 'sts',
                    'region_name': region,
                    'aws_access_key_id': access_key,
                    'aws_secret_access_key': secret_key
                }
                
                # Add session token if provided
                if session_token:
                    client_kwargs['aws_session_token'] = session_token
                    
                client = boto3.client(**client_kwargs)
                identity = client.get_caller_identity()
                session['aws_identity'] = f"Authenticated as: {identity.get('Arn', 'Unknown')}"
                return redirect(url_for('index'))
            except Exception as e:
                # Clear invalid credentials
                session.pop('aws_access_key', None)
                session.pop('aws_secret_key', None)
                session.pop('aws_session_token', None)
                session.pop('aws_region', None)
                error = f"Invalid credentials: {str(e)}"
        else:
            # No credentials provided, proceed with instance profile
            session['aws_region'] = region
            return redirect(url_for('index'))
    
    return render_template('aws_credentials.html', error=error, user_name=session.get('user_name'))

@app.route('/')
@cognito_auth_required
def index():
    """Render the main page with navigation options"""
    # Check if AWS credentials are needed
    if 'aws_access_key' not in session and 'skipped_login' not in session:
        return redirect(url_for('aws_credentials'))
    return render_template('index.html', user_name=session.get('user_name'))

# Add all your existing routes here with @cognito_auth_required instead of @requires_auth
@app.route('/GetOpportunity', methods=['GET'])
@cognito_auth_required
def get_opportunity_page():
    """Render the get opportunity page"""
    return render_template('get_opportunity.html')

@app.route('/ListOpportunities', methods=['GET'])
@cognito_auth_required
def list_opportunities_page():
    """Render the list opportunities page"""
    return render_template('list_opportunities.html')

@app.route('/ListSolutions', methods=['GET'])
@cognito_auth_required
def list_solutions_page():
    """Render the list solutions page"""
    return render_template('list_solutions.html')

@app.route('/ListEngagementInvitations', methods=['GET'])
@cognito_auth_required
def list_engagement_invitations_page():
    """Render the list engagement invitations page"""
    return render_template('list_engagement_invitations.html')

@app.route('/GetEngagementInvitation', methods=['GET'])
@cognito_auth_required
def get_engagement_invitation_page():
    """Render the get engagement invitation page"""
    return render_template('get_engagement_invitation.html')

@app.route('/CreateOpportunity', methods=['GET'])
@cognito_auth_required
def create_opportunity_page():
    """Render the create opportunity page"""
    # Read the default JSON payload from the file
    default_payload = ""
    try:
        with open(os.path.join(os.path.dirname(__file__), 'create_opportunity/createOpportunity.json'), 'r') as f:
            default_payload = f.read()
            # Prepare the default payload with random title and client token
            default_payload = create_opportunity_api.prepare_default_payload(default_payload)
    except Exception as e:
        default_payload = "{}"
        
    # Pass the default payload as a JSON string with proper escaping
    return render_template('create_opportunity_form.html', default_payload=default_payload)

@app.route('/CreateAwsOpportunity', methods=['GET'])
@cognito_auth_required
def create_aws_opportunity_page():
    """Render the create AWS opportunity page"""
    # Read the default JSON payload from the file
    default_payload = ""
    try:
        with open(os.path.join(os.path.dirname(__file__), 'create_opportunity/createOpportunity_aws.json'), 'r') as f:
            default_payload = f.read()
            # Prepare the default payload with random title and client token
            default_payload = create_aws_opportunity_api.prepare_default_payload(default_payload)
    except Exception as e:
        default_payload = "{}"
        
    # Pass the default payload as a JSON string with proper escaping
    return render_template('create_aws_opportunity.html', default_payload=default_payload)

@app.route('/AssociateOpportunity', methods=['GET'])
@cognito_auth_required
def associate_opportunity_page():
    """Render the associate opportunity page"""
    return render_template('associate_opportunity.html')

@app.route('/StartEngagementFromOpportunity', methods=['GET'])
@cognito_auth_required
def start_engagement_from_opportunity_page():
    """Render the start engagement from opportunity page"""
    return render_template('start_engagement_from_opportunity.html')

@app.route('/SimulateApproval', methods=['GET'])
@cognito_auth_required
def simulate_approval_page():
    """Render the simulate approval page"""
    return render_template('simulate_approval.html')

@app.route('/SimulateActionRequired', methods=['GET'])
@cognito_auth_required
def simulate_action_required_page():
    """Render the simulate action required page"""
    return render_template('simulate_action_required.html')

@app.route('/AcceptEngagementInvitation', methods=['GET'])
@cognito_auth_required
def accept_engagement_invitation_page():
    """Render the accept engagement invitation page"""
    return render_template('accept_engagement_invitation.html')

@app.route('/UpdateOpportunityStage', methods=['GET'])
@cognito_auth_required
def update_opportunity_stage_page():
    """Render the update opportunity stage page"""
    return render_template('update_opportunity_stage.html')

# API routes
@app.route('/api/get_opportunity', methods=['POST'])
@cognito_auth_required
def fetch_opportunity():
    opportunity_id = request.form.get('opportunity_id')
    if not opportunity_id:
        return jsonify({"error": "Opportunity ID is required"}), 400
    try:
        result = get_opportunity.get_opportunity(opportunity_id)
        if isinstance(result, dict) and "error" in result:
            return jsonify({"error": result["error"]}), 500
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/list_opportunities', methods=['POST'])
@cognito_auth_required
def fetch_opportunities():
    try:
        result = list_opportunities_noPaging.get_list_of_opportunities()
        if isinstance(result, dict) and "error" in result:
            return jsonify({"error": result["error"]}), 500
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/list_solutions', methods=['POST'])
@cognito_auth_required
def fetch_solutions():
    try:
        result = list_solutions.get_list_of_solutions()
        if isinstance(result, dict) and "error" in result:
            return jsonify({"error": result["error"]}), 500
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/list_engagement_invitations', methods=['POST'])
@cognito_auth_required
def fetch_engagement_invitations():
    try:
        result = list_engagement_invitations.list_engagement_invitations()
        if isinstance(result, dict) and "error" in result:
            return jsonify({"error": result["error"]}), 500
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/get_engagement_invitation', methods=['POST'])
@cognito_auth_required
def fetch_engagement_invitation():
    invitation_id = request.form.get('invitation_id')
    if not invitation_id:
        return jsonify({"error": "Invitation ID is required"}), 400
    try:
        result = get_engagement_invitation.get_opportunity_engagement_invitation(invitation_id)
        if isinstance(result, dict) and "error" in result:
            return jsonify({"error": result["error"]}), 500
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/create_opportunity', methods=['POST'])
@cognito_auth_required
def create_opportunity():
    payload = request.form.get('payload')
    client_token = request.form.get('client_token')
    origin = request.form.get('origin')
    
    if not payload:
        return jsonify({"error": "JSON payload is required"}), 400
    
    try:
        # Parse the JSON payload
        payload_json = json.loads(payload)
        
        # Determine which API to use based on the origin
        if origin == "AWS Referral":
            # Use the AWS opportunity API
            result = create_aws_opportunity_api.create_opportunity_with_payload(payload_json, client_token)
        else:
            # Use the standard opportunity API
            result = create_opportunity_api.create_opportunity_with_payload(payload_json, client_token)
        
        # Convert datetime objects to ISO format for JSON serialization
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        
        return jsonify({"result": json.loads(json_result)})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/associate_opportunity', methods=['POST'])
@cognito_auth_required
def associate_opportunity():
    opportunity_id = request.form.get('opportunity_id')
    entity_type = request.form.get('entity_type')
    entity_id = request.form.get('entity_id')
    
    if not all([opportunity_id, entity_type, entity_id]):
        return jsonify({"error": "All fields are required"}), 400
    
    try:
        result = associate_opportunity_api.associate_opportunity_with_entity(opportunity_id, entity_type, entity_id)
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/start_engagement_from_opportunity', methods=['POST'])
@cognito_auth_required
def start_engagement():
    opportunity_id = request.form.get('opportunity_id')
    if not opportunity_id:
        return jsonify({"error": "Opportunity ID is required"}), 400
    try:
        result = start_engagement_from_opportunity_api.start_engagement_from_opportunity(opportunity_id)
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/simulate_approval', methods=['POST'])
@cognito_auth_required
def simulate_approval():
    opportunity_id = request.form.get('opportunity_id')
    if not opportunity_id:
        return jsonify({"error": "Opportunity ID is required"}), 400
    try:
        result = simulate_approval_api.get_and_update_opportunity(opportunity_id)
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/simulate_action_required', methods=['POST'])
@cognito_auth_required
def simulate_action_required():
    opportunity_id = request.form.get('opportunity_id')
    if not opportunity_id:
        return jsonify({"error": "Opportunity ID is required"}), 400
    try:
        result = simulate_action_required_api.get_and_update_opportunity(opportunity_id)
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/accept_engagement_invitation', methods=['POST'])
@cognito_auth_required
def accept_invitation():
    invitation_id = request.form.get('invitation_id')
    if not invitation_id:
        return jsonify({"error": "Invitation ID is required"}), 400
    try:
        result = start_engagement_by_accepting_invitation_task.start_engagement_by_accepting_invitation_task(invitation_id)
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/update_opportunity_stage', methods=['POST'])
@cognito_auth_required
def update_opportunity_stage():
    opportunity_id = request.form.get('opportunity_id')
    stage = request.form.get('stage')
    if not opportunity_id or not stage:
        return jsonify({"error": "Opportunity ID and stage are required"}), 400
    try:
        result = update_opportunity_stage_api.update_opportunity_stage(opportunity_id, stage)
        json_result = json.dumps(result, cls=DateTimeEncoder, indent=4)
        return jsonify({"result": json.loads(json_result)})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/debug')
def debug():
    """Debug route to check configuration"""
    config = {
        'USER_POOL_ID': USER_POOL_ID,
        'CLIENT_ID': CLIENT_ID,
        'REGION': REGION,
        'COGNITO_DOMAIN': COGNITO_DOMAIN,
        'REDIRECT_URI': REDIRECT_URI
    }
    return jsonify(config)

@app.route('/direct-login')
def direct_login():
    """Direct login form for testing"""
    # If user is already authenticated, redirect to index
    if 'id_token' in session:
        return redirect(url_for('index'))
    return render_template('direct_login.html', error=request.args.get('error'))

@app.route('/authenticate', methods=['POST'])
def authenticate():
    """Handle direct login authentication"""
    username = request.form.get('username')
    password = request.form.get('password')
    
    if not username or not password:
        return redirect(url_for('direct_login', error="Username and password are required"))
    
    try:
        # Create a Cognito Identity Provider client
        client = boto3.client('cognito-idp', region_name=REGION)
        
        # Initiate auth
        response = client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password
            }
        )
        
        # Store tokens in session
        auth_result = response.get('AuthenticationResult', {})
        session['access_token'] = auth_result.get('AccessToken')
        session['id_token'] = auth_result.get('IdToken')
        session['refresh_token'] = auth_result.get('RefreshToken')
        
        # Get user info
        user_response = client.get_user(
            AccessToken=session['access_token']
        )
        
        # Extract user attributes
        user_attrs = {attr['Name']: attr['Value'] for attr in user_response.get('UserAttributes', [])}
        session['user_email'] = user_attrs.get('email')
        session['user_name'] = user_attrs.get('name', username)
        
        return redirect(url_for('aws_credentials'))
    except client.exceptions.NotAuthorizedException as e:
        logger.error(f"Not authorized: {str(e)}")
        return redirect(url_for('direct_login', error="Invalid username or password"))
    except client.exceptions.UserNotConfirmedException:
        return redirect(url_for('direct_login', error="User is not confirmed"))
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return redirect(url_for('direct_login', error=f"Authentication error: {str(e)}"))

if __name__ == "__main__":
    if ENV == 'ec2':
        # For EC2 deployment
        app.run(host='0.0.0.0', port=8800, debug=False)
    else:
        # For local development
        app.run(host='localhost', port=8800, debug=True)



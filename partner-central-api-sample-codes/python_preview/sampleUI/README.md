# Partner Central API Web Interface

This web application provides a user interface for interacting with the AWS Partner Central API. It allows you to perform various operations such as creating opportunities, listing solutions, managing engagements, and more.

## Prerequisites

- Python 3.8 or higher
- AWS account with access to Partner Central API
- AWS credentials with appropriate permissions
- Flask and other dependencies listed in requirements.txt

## Setup Instructions

### 1. Local Environment Setup

Create and activate a virtual environment:

```shell
python -m venv pcapi
source ./pcapi/bin/activate  # On Windows: .\pcapi\Scripts\activate
python -m pip install -r requirements.txt
```

If you need to uninstall previously installed boto3:
```shell
pip uninstall boto3
pip cache purge
```

### 2. AWS Credentials Setup

The application requires AWS credentials to access the Partner Central API. There are several ways to configure these credentials:

For detailed information, refer to the official documentation:
- [Partner Central API Setup and Authentication](https://docs.aws.amazon.com/partner-central/latest/APIReference/setup-authentication.html)
- [Partner Central API Access Control and Permissions](https://docs.aws.amazon.com/partner-central/latest/APIReference/access-control.html)
- [AWS Partner Central API Workshop - Credentials Setup](https://catalog.workshops.aws/partner-central-api/en-US/prerequisites/aws-account)

#### Option 1: AWS CLI Configuration (Recommended for Local Development)

Install and configure the AWS CLI:
```shell
pip install awscli
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, default region (e.g., us-east-1), and output format when prompted.

#### Option 2: Instance Profile (Recommended for EC2 Deployment)

When deploying to EC2, attach an IAM role to the instance with the necessary permissions for Partner Central API access. The application will automatically use the instance profile credentials.

#### To note: 
By default, the application will skip the AWS credentials page and use credentials from the AWS credentials file or instance profile. To enable users to enter their own AWS credentials:
1. Set useLogin to True in `config.py`:
   ```python
   CONFIG = {
    'useLogin': True  # Set to True to enable AWS credentials login page, False to skip it
    }
    ```
2. When useLogin is True, users will be prompted to enter their AWS credentials after logging in with Cognito.

3. When useLogin is False, the application will use credentials from the AWS credentials file or instance profile.

#### Credential Priority
The application uses the following priority order for AWS credentials:

- When useLogin is True:

    1. Environment variables (set from session in app.py from user entered AWS credentials)
    2. AWS credentials file (for local development)
    3. Instance profile (for EC2 deployment)

- When useLogin is False:

    1. AWS credentials file (for local development)
    2. Instance profile (for EC2 deployment)


### 3. Amazon Cognito Setup (Required)

The application uses Amazon Cognito for authentication:

1. Create a Cognito User Pool in the AWS Console
2. Create an App Client in the User Pool
3. Configure the App Client settings:
   - Enable the authorization code grant flow
   - Add the callback URL for your application
   - Select the appropriate OAuth scopes

4. Update the configuration in `app.py` :
   ```python
   USER_POOL_ID = 'us-east-1_daXTsClRy'  # Replace with your User Pool ID
   CLIENT_ID = '7tep9c1o3lhl4k6stm6rjf0vjg'  # Replace with your App Client ID
   REGION = 'us-east-1'  # Replace with your AWS region
    ```
   or create a `config.py` file:
    ```python
    COGNITO_CONFIG = {
    'REGION': 'us-east-1',
    'USER_POOL_ID': 'your_user_pool_id',
    'APP_CLIENT_ID': 'your_app_client_id',
    'DOMAIN': 'your_cognito_domain',
    'REDIRECT_URI': 'http://localhost:8800/callback'
    }
    ```

### 4. Running the Application Locally

Start the Flask application:
```shell
cd sampleUI
python app.py
```

The application will be available at http://localhost:8800. 

Authentication is handled through Amazon Cognito. You'll need to configure Cognito as described in the previous section and follow the login flow when accessing the application.

### 5. Deploying on EC2

1. Launch an EC2 instance with Amazon Linux 2
2. Attach an IAM role with the necessary permissions
3. Connect to the instance using SSH
4. Install required packages:
```shell
sudo yum update -y
sudo yum install -y python3 python3-pip git
```

5. Clone the repository:
```shell
git clone git@github.com:aws-samples/partner-crm-integration-samples.git
cd partner-crm-integration-samples/partner-central-api-sample-codes/python_preview
```

6. Set up the environment:
```shell
python3 -m venv pcapi
source pcapi/bin/activate
pip install -r requirements.txt
```

7. Run the application:
```shell
cd sampleUI
python app.py
```

For production deployment, consider using a WSGI server like Gunicorn:
```shell
pip install gunicorn
gunicorn -b 0.0.0.0:8800 app:app
```

8. (Optional) Set up a systemd service for automatic startup:
```shell
sudo nano /etc/systemd/system/partner-central-api.service
```

Add the following content:
```
[Unit]
Description=Partner Central API Web Interface
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/partner-crm-integration-samples/partner-central-api-sample-codes/python_preview/sampleUI
ExecStart=/home/ec2-user/partner-crm-integration-samples/partner-central-api-sample-codes/python_preview/pcapi/bin/gunicorn -b 0.0.0.0:8800 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```shell
sudo systemctl enable partner-central-api
sudo systemctl start partner-central-api
```

## Required IAM Permissions

The IAM role or user needs the following permissions:
- `partnercentral-selling:*` - For all Partner Central API operations
- `s3:GetObject` - If using S3 for configuration or assets
- `cognito-idp:*` - If using Amazon Cognito for authentication

## Troubleshooting

- **API Access Issues**: Ensure your AWS credentials have the necessary permissions
- **Connection Errors**: Check your network configuration and AWS region settings
- **Authentication Failures**: Verify your credentials and Cognito configuration
- **Mock Data**: Use the "Use Mock Data" buttons if you don't have access to the real API

## Security Considerations

- Never hardcode AWS credentials in your code
- Use IAM roles with least privilege principles
- Enable HTTPS when deploying to production
- Regularly rotate credentials
- Consider implementing additional authentication mechanisms

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
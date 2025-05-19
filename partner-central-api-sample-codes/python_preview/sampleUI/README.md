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

#### Option 2: Environment Variables

Set the following environment variables:
```shell
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

#### Option 3: Instance Profile (Recommended for EC2 Deployment)

When deploying to EC2, attach an IAM role to the instance with the necessary permissions for Partner Central API access. The application will automatically use the instance profile credentials.

### 3. Amazon Cognito Setup (Required)

The application uses Amazon Cognito for authentication:

1. Create a Cognito User Pool in the AWS Console
2. Create an App Client in the User Pool
3. Configure the App Client settings:
   - Enable the authorization code grant flow
   - Add the callback URL for your application
   - Select the appropriate OAuth scopes

4. Update the configuration in `app.py` or create a `config.py` file:
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
import os
import json
import boto3

#session from iam access keys
#access keys for Partner IAM user. Partner will created them in their AWS account
session = boto3.Session(
    aws_access_key_id='<access key Id>',
    aws_secret_access_key='<securet Access key>',
)
s3_client = session.client('s3')
# s3_client = boto3.client('s3')
session.client('sts').get_caller_identity().get('Account')

def lambda_handler(event, context):
    print(session.client('sts').get_caller_identity().get('Account'))
  
    bucket_name = '<bucket name>'
    
    # object_key = 'lead-outbound/Leads_Outbound.json'
    # s3_object_response = s3_client.get_object(
    #     Bucket=bucket_name,
    #     Key=object_key
    # )
    # print(s3_object_response)
    # print(s3_object_response.get('ContentLength')) # Size of the body in bytes.
    # print(s3_object_response['Body'].read().decode('utf-8'))
    
    objects_summary = s3_client.list_objects_v2(
        Bucket=bucket_name,
        Prefix = 'lead-outbound/'
    )
    print(type(objects_summary))
    print(objects_summary['Contents'])
    
    for object_detail in objects_summary['Contents']:
        print(object_detail)
        if(object_detail['Size'] > 0):
            
            object_key = object_detail['Key']
            tags_res = s3_client.get_object_tagging(
                Bucket=bucket_name,
                Key=object_key
            )
            is_previously_read = False
            tags = tags_res['TagSet'] 
            print('tags', tags)
            for tag in tags:
                print(tag)
                if (tag['Key'] == 'partner_processed') and ( tag['Value'] == 'true'):
                    print('ALeady READ')
                    is_previously_read = True
            
            print('is_previously_read', is_previously_read)
            if is_previously_read is False:
                print(object_key)
                s3_object_response = s3_client.get_object(
                    Bucket=bucket_name,
                    Key=object_key
                )
                print(s3_object_response)
                print(s3_object_response.get('ContentLength')) # Size of the body in bytes.
                body_data = s3_object_response['Body'].read().decode('utf-8')
                
                #send body data to target system
                
                # partner can tag object as processed
                response = s3_client.put_object_tagging(
                    Bucket=bucket_name,
                    Key=object_key,
                    Tagging={
                        'TagSet': [
                            {
                                'Key': 'partner_processed',
                                'Value': 'true'
                            },
                        ]
                    }
                )
                print(response)


    return {
        'statusCode': 200,
        'body': json.dumps('success')
    }

// This is sample code for sending data from Salesforce to S3 by using batch apex
public with sharing class Sample_AceOutboundBatch implements Database.Batchable<SObject>, Database.Stateful, Database.AllowsCallouts {
    private final String QUERY = 'SELECT Id FROM Opportunity';  
    private final String FILE_EXTENSION = '.json'; 
    private final String METHOD = 'PUT'; 
    private final String FILE_NAME = 'Opportunity'; 
    private final String BUCKET_NAME = 'BucketName/';  
    
    public Sample_AceOutboundBatch() {
    }

    public Database.QueryLocator start(Database.BatchableContext BC) { 
        return Database.getQueryLocator(QUERY);
    }

    public void execute(Database.BatchableContext BC, List<Opportunity> scope) {  
        String finalJSON = JSON.serialize(scope);                        
        String filename = FILE_NAME;
        filename += '-' + Datetime.now().month() + '-' + Datetime.now().day() + '-' + Datetime.now().year();
        filename += '-' + Datetime.now().hour() + 'h-' + Datetime.now().minute() + 'm-' + Datetime.now().second() + 's'; 

        String user = 'User Name';
        String pass = 'Password';
        String region = 'us-east-2'; // Change this to your bucket's region
        String endPointURL = 'https://' + BUCKET_NAME + '.s3.amazonaws.com/' + BUCKET_NAME;

        PageReference pr = new PageReference(endPointURL + filename + FILE_EXTENSION);
        Url endpoint = new Url(pr.getUrl());
        
        Http http = new Http();
        HttpRequest req = new HttpRequest(); 

        S3_Authentication s3Authentication = new S3_Authentication();
        req = s3Authentication.signedRequest(METHOD,endpoint,null,Blob.valueOf(finalJSON),true,user,pass,region);

        HTTPResponse res = http.send(req);
    }

    public void finish(Database.BatchableContext BC) {
        // Do Something
    } 
}

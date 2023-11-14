//Update the s3_ace_partner_test.test method with valid partner AccessKey , AccessSecret and bucket name. and run to test.
//s3_ace_partner_test.test();

public class s3_ace_partner_test {
	
    public static void test(){
        
        Http http = new Http();
        HttpRequest req = new HttpRequest(); 
        
        String user = 'lsldnlfknsdlflfksd';
        String pass = 'sdffsdf/lkdmv/xcv+sdfsdfs';
        String region = 'us-west-2';
        
        String METHOD = 'GET';
        String opptyKeyPrefix = 'opportunity-outbound/';
        String bucketName = 'ace-apn-8888-beta-beta-us-west-2';
        String endPointURL = 'https://s3.'+ region +'.amazonaws.com/' + bucketName + '/?list-type=2&prefix='+opptyKeyPrefix;
        //String filename = '1213.json';
        PageReference pr = new PageReference(endPointURL);
        Url endpoint = new Url(pr.getUrl());
                                                       
        Map<String,String> headers1 = new Map<String,String>();
        headers1.put('Content-Type', 'application/json');
        //headers1.put('x-amz-acl', 'bucket-owner-full-control');
        
        S3_Authentication s3Authentication = new S3_Authentication();
        req = s3Authentication.signedRequest(METHOD,endpoint,headers1,null,true,user,pass,region);
        System.debug('=====> Check req: '+req);     
        
        HTTPResponse res = http.send(req);
        System.debug('=====> Check res: '+res.getBody());
        List<String> opptyS3Keys = new List<String>();
        if(res.getStatusCode() == 200){
            Dom.Document doc = res.getBodyDocument();
            Dom.XMLNode listBucketResult = doc.getRootElement();
            String xmlNameSpace = listBucketResult.getNamespace();        
            List<Dom.XMLNode> children = listBucketResult.getChildElements();
            for(Dom.XMLNode nde : children){
                if(nde.getName() == 'Contents'){
                    system.debug(nde.getName() );
                    system.debug(nde.getNodeType() );
                    system.debug(nde.getNamespace() );
                    Dom.XMLNode keyNode = nde.getChildElement('Key', xmlNameSpace) ;
                    system.debug(keyNode.getText() );
                    opptyS3Keys.add(keyNode.getText());
                }
            }
		}
        for(String s3Key : opptyS3Keys){
             String s3ObjURL = 'https://s3.'+ region +'.amazonaws.com/' + bucketName + '/';
             String s3ObjKey = s3Key;
             //PageReference pr = new PageReference(s3ObjURL+s3Key).getUrl();
        	 Url s3objendpoint = new Url(new PageReference(s3ObjURL+s3Key).getUrl());
            Map<String,String> headers = new Map<String,String>();
            HttpRequest s3getreq = s3Authentication.signedRequest(METHOD,s3objendpoint,headers,null,true,user,pass,region);
            System.debug('=====> Check req: '+req);     
            
            HTTPResponse getObjres = http.send(s3getreq);
            System.debug('=====> Check getObjres: '+getObjres.getBody());
        }
    }
}
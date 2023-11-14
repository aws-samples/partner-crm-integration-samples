@RestResource(urlMapping='/ace/api/v1/leads')
global with sharing class MyRestResource { 
  @HttpPut
    global static String doPut(String name) {
        System.debug('Print Name: '+name);        
        return name;
    }
}
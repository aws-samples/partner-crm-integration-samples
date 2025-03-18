// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

// snippet-start:[eventbridge.java2._create_schedule_rule.import]
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.model.PutRuleRequest;
import software.amazon.awssdk.services.eventbridge.model.PutRuleResponse;
import software.amazon.awssdk.services.eventbridge.model.PutTargetsRequest;
import software.amazon.awssdk.services.eventbridge.model.PutTargetsResponse;
import software.amazon.awssdk.services.eventbridge.model.Target;
// snippet-end:[eventbridge.java2._create_schedule_rule.import]
/**
 * Create Opportunity Created EventBridge rule and target is set to Lambda function
 */
public class OpportunityEventHandling {
	public static void main(String[] args) {
        Region region = Region.US_EAST_1;
        EventBridgeClient eventBridgeClient = EventBridgeClient.builder()
                .region(region)
                .build();

        // Opportunity Updated; Opportunity Created; Opportunity Accepted; Opportunity Rejected
        String eventType = "Opportunity Created";

        Map<String, Object> eventPattern = new HashMap<>();
        eventPattern.put("source", new String[]{"aws.partnercentral-selling"});
        eventPattern.put("detail-type", new String[]{eventType});
        Map<String, String[]> detail = new HashMap<>();
        detail.put("environmentName", new String[]{"Production"});
        eventPattern.put("detail", detail);

        ObjectMapper objectMapper = new ObjectMapper();
        String eventPatternJson;
        try {
            eventPatternJson = objectMapper.writeValueAsString(eventPattern);
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }

        String targetId = "MingOpportunityEventLambda";
        String lambdaArn = "arn:aws:lambda:us-east-1:111111111111:function:event-bridge-lambda";
        String ruleName = "MyOpportunityCreatedRuleJava";

        // Create Rule
        PutRuleRequest putRuleRequest = PutRuleRequest.builder()
                .name(ruleName)
                .eventPattern(eventPatternJson)
                .build();

        PutRuleResponse putRuleResponse = eventBridgeClient.putRule(putRuleRequest);
        System.out.println("Rule ARN: " + putRuleResponse.ruleArn());

        // Create Target
        Target target = Target.builder()
                .id(targetId)
                .arn(lambdaArn)
                .build();

        PutTargetsRequest putTargetsRequest = PutTargetsRequest.builder()
                .rule(ruleName)
                .targets(target)
                .build();

        PutTargetsResponse putTargetsResponse = eventBridgeClient.putTargets(putTargetsRequest);
        System.out.println("Failed Targets: " + putTargetsResponse.failedEntryCount());
    }
}
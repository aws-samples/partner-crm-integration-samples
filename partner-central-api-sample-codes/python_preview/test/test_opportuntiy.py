# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import src.list_opportunities_noPaging
import src.create_opportunity
import src.start_engagement_by_accepting_invitation_task
import src.start_engagement_from_opportunity_task
import src.get_aws_opportunity_summary
import src.get_engagement_invitation
import src.assign_opportunity
import src.associate_opportunity
import src.disassociate_opportunity
import src.get_engagement_invitation
import src.get_opportunity
import src.reject_opportunity_engagement_invitation
import src.list_solutions

def test_list_opportunities_noPaging():
    response = src.list_opportunities_noPaging.get_list_of_opportunities()
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_create_opportunity():
    response = src.create_opportunity.create_opportunity()
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_update_opportunity():
    identifier = "O3576511"
    response = src.update_opportunity.update_partner_originated_opportunity.update_opportunity_if_eligible(identifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_start_engagement_by_accepting_invitation_task():
    identifier = "O3576511"
    response = src.start_engagement_by_accepting_invitation_task.start_engagement_by_accepting_invitation_task(identifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_start_engagement_from_opportunity_task():
    identifier = "O3576511"
    response = src.start_engagement_from_opportunity_task.start_engagement_from_opportunity_task(identifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_assign_opportunity():
    identifier = "O3576511"
    response = src.assign_opportunity.assign_opportunity(identifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_associate_opportunity():
    entity_type = "Solutions"
    entity_identifier = "45465681322"
    opportunityIdentifier = "O3576511"
    response = src.associate_opportunity.associate_opportunity(entity_type, entity_identifier, opportunityIdentifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_disassociate_opportunity():
    entity_type = "Solutions"
    entity_identifier = "45465681322"
    opportunityIdentifier = "O3576511"
    response = src.disassociate_opportunity.disassociate_opportunity(entity_type, entity_identifier, opportunityIdentifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_get_opportunity():
    identifier = "O3576511"
    response = src.get_opportunity.get_opportunity(identifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_get_aws_opportunity_summary():
    identifier = "O3576511"
    response = src.get_aws_opportunity_summary.get_opportunity(identifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_get_engagement_invitation():
    identifier = "arn:aws:partnercentral-selling:us-east-1:aws:catalog/Sandbox/engagement-invitation/engi-0000000IS0Qga"
    response = src.get_engagement_invitation.get_opportunity_engagement_invitation(identifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_reject_opportunity():
    identifier = "O3576511"
    response = src.reject_opportunity_engagement_invitation.reject_opportunity_engagement_invitation(identifier)
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_list_solutions():
    response = src.list_solutions.get_list_of_solutions()
    assert response is not None and response["ResponseMetadata"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] is not None and response["ResponseMetadata"]["HTTPStatusCode"] == 200
#!/usr/bin/env python3
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""
End-to-end workflow testing script for AWS Marketplace Opportunity to Offer
Tests the complete workflow from product creation to opportunity commitment
"""

import json
import time
import sys
import os
import subprocess
from datetime import datetime
from pathlib import Path

# Workflow configuration
WORKFLOW_DIR = Path(__file__).parent
LOG_FILE = WORKFLOW_DIR / f"workflow.{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
SHARED_ENV_FILE = WORKFLOW_DIR / "shared_env.json"

# Polling configuration
POLL_INTERVAL = 10  # seconds
MAX_POLL_ATTEMPTS = 120  # 20 minutes max


class WorkflowLogger:
    """Logger for workflow execution"""
    
    def __init__(self, log_file):
        self.log_file = log_file
        
    def log(self, message, level="INFO"):
        """Log message to both console and file"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] [{level}] {message}"
        print(log_entry)
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry + "\n")
    
    def log_json(self, data, title=""):
        """Log JSON data"""
        if title:
            self.log(f"\n{title}")
        json_str = json.dumps(data, indent=2, default=str)
        self.log(json_str)
        
        with open(self.log_file, 'a') as f:
            f.write(json_str + "\n")


class WorkflowExecutor:
    """Executes the complete workflow"""
    
    def __init__(self, logger):
        self.logger = logger
        self.shared_env = self.load_shared_env()
        
    def load_shared_env(self):
        """Load shared environment variables"""
        if SHARED_ENV_FILE.exists():
            with open(SHARED_ENV_FILE, 'r') as f:
                return json.load(f)
        return {}
    
    def save_shared_env(self):
        """Save shared environment variables"""
        with open(SHARED_ENV_FILE, 'w') as f:
            json.dump(self.shared_env, f, indent=2)
        self.logger.log(f"Saved shared environment to {SHARED_ENV_FILE}")
    
    def run_python_script(self, script_path, *args):
        """Run a Python script and return the result"""
        cmd = [sys.executable, str(script_path)] + list(args)
        self.logger.log(f"Running: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                cwd=WORKFLOW_DIR,
                capture_output=True,
                text=True,
                stdin=subprocess.DEVNULL,  # Prevent waiting for input
                env={**os.environ, 'PYTHONPATH': str(WORKFLOW_DIR)}
            )
            
            self.logger.log(f"Exit code: {result.returncode}")
            if result.stdout:
                self.logger.log(f"STDOUT:\n{result.stdout}")
            if result.stderr:
                self.logger.log(f"STDERR:\n{result.stderr}", level="WARN")
            
            return result
        except Exception as e:
            self.logger.log(f"Error running script: {e}", level="ERROR")
            raise
    
    def run_python_script_live(self, script_path, *args):
        """Run a Python script with live output"""
        cmd = [sys.executable, str(script_path)] + list(args)
        
        try:
            result = subprocess.run(
                cmd,
                cwd=WORKFLOW_DIR,
                text=True,
                env={**os.environ, 'PYTHONPATH': str(WORKFLOW_DIR)}
            )
            return result
        except Exception as e:
            self.logger.log(f"Error running script: {e}", level="ERROR")
            raise
    
    def poll_changeset_status(self, changeset_id, describe_script):
        """Poll changeset status until SUCCEEDED or FAILED"""
        print(f"\n{'='*60}")
        print(f"Polling changeset: {changeset_id}")
        print(f"{'='*60}")
        self.logger.log(f"Polling changeset {changeset_id} for completion...")
        
        for attempt in range(MAX_POLL_ATTEMPTS):
            print(f"\n[Poll {attempt + 1}/{MAX_POLL_ATTEMPTS}]")
            self.logger.log(f"Poll attempt {attempt + 1}/{MAX_POLL_ATTEMPTS}")
            
            # Run describe_changeset with live output
            cmd = [sys.executable, str(describe_script), changeset_id]
            self.logger.log(f"Running: {' '.join(cmd)}")
            
            try:
                result = subprocess.run(
                    cmd,
                    cwd=WORKFLOW_DIR,
                    capture_output=True,
                    text=True,
                    stdin=subprocess.DEVNULL,  # Prevent waiting for input
                    env={**os.environ, 'PYTHONPATH': str(WORKFLOW_DIR)}
                )
                
                # Log to file
                if result.stdout:
                    self.logger.log(f"STDOUT:\n{result.stdout}")
                if result.stderr:
                    self.logger.log(f"STDERR:\n{result.stderr}", level="WARN")
                
                if result.returncode != 0:
                    print("❌ FAILED to describe changeset")
                    self.logger.log("Failed to describe changeset", level="ERROR")
                    return None
                
                # Parse the output to find status
                current_status = None
                for line in result.stdout.split('\n'):
                    if 'Status:' in line:
                        current_status = line.split('Status:')[1].strip()
                        break
                
                if current_status:
                    # Print status with color/emoji
                    if current_status == "SUCCEEDED":
                        print(f"✅ Status: {current_status}")
                        self.logger.log(f"Changeset status: {current_status}")
                        self.logger.log("✓ Changeset succeeded!", level="SUCCESS")
                        return "SUCCEEDED"
                    elif current_status == "FAILED":
                        print(f"❌ Status: {current_status}")
                        self.logger.log(f"Changeset status: {current_status}")
                        self.logger.log("✗ Changeset failed!", level="ERROR")
                        # Print full output for failed changeset
                        print("\n" + "="*60)
                        print("FAILED CHANGESET DETAILS:")
                        print("="*60)
                        print(result.stdout)
                        print("="*60)
                        return "FAILED"
                    elif current_status in ["PREPARING", "APPLYING"]:
                        print(f"⏳ Status: {current_status} (in progress)")
                        self.logger.log(f"Changeset status: {current_status} (in progress)")
                    else:
                        print(f"🔄 Status: {current_status}")
                        self.logger.log(f"Changeset status: {current_status}")
                else:
                    print("⚠️  Status not found in output")
                    self.logger.log("Could not parse status from output", level="WARN")
                    
            except Exception as e:
                print(f"⚠️  Error: {e}")
                self.logger.log(f"Error polling changeset: {e}", level="ERROR")
            
            if attempt < MAX_POLL_ATTEMPTS - 1:
                print(f"⏰ Waiting {POLL_INTERVAL} seconds before next check...")
                self.logger.log(f"Waiting {POLL_INTERVAL} seconds before next poll...")
                time.sleep(POLL_INTERVAL)
        
        print("\n❌ TIMEOUT - Max poll attempts reached")
        self.logger.log("Max poll attempts reached", level="ERROR")
        return "TIMEOUT"
    
    def extract_changeset_id(self, output):
        """Extract changeset ID from script output"""
        for line in output.split('\n'):
            if 'ChangeSet ID:' in line or 'CHANGESET_ID' in line:
                # Try to extract ID
                parts = line.split(':')
                if len(parts) > 1:
                    changeset_id = parts[1].strip()
                    if changeset_id:
                        return changeset_id
        return None
    
    def extract_product_id(self, output):
        """Extract product ID from script output"""
        for line in output.split('\n'):
            if 'Product ID:' in line or 'PRODUCT_ID' in line:
                parts = line.split(':')
                if len(parts) > 1:
                    product_id = parts[1].strip()
                    if product_id.startswith('prod-'):
                        return product_id
        return None
    
    def extract_offer_id(self, output):
        """Extract offer ID from script output"""
        for line in output.split('\n'):
            if 'Offer ID:' in line or 'offer-' in line:
                # Look for offer-xxxxx pattern
                import re
                match = re.search(r'offer-[a-z0-9]+', line)
                if match:
                    return match.group(0)
        return None
    
    def extract_opportunity_id(self, output):
        """Extract opportunity ID from script output"""
        for line in output.split('\n'):
            if '"Id":' in line or 'Opportunity ID:' in line:
                import re
                match = re.search(r'O\d+', line)
                if match:
                    return match.group(0)
        return None
    
    def step1_create_product(self):
        """Step 1: Create SaaS Product"""
        self.logger.log("\n" + "="*80)
        self.logger.log("STEP 1: Create SaaS Product")
        self.logger.log("="*80)
        
        script = WORKFLOW_DIR / "1_publishSaasProcuct" / "start_changeset.py"
        result = self.run_python_script(script)
        
        if result.returncode != 0:
            self.logger.log("Failed to start product creation", level="ERROR")
            return False
        
        # Extract changeset ID
        changeset_id = self.extract_changeset_id(result.stdout)
        if not changeset_id:
            self.logger.log("Could not extract changeset ID", level="ERROR")
            return False
        
        self.logger.log(f"Changeset ID: {changeset_id}")
        self.shared_env['PRODUCT_CHANGESET_ID'] = changeset_id
        self.save_shared_env()
        
        # Poll for completion
        describe_script = WORKFLOW_DIR / "1_publishSaasProcuct" / "describe_changeset.py"
        status = self.poll_changeset_status(changeset_id, describe_script)
        
        if status != "SUCCEEDED":
            return False
        
        # Extract and save product ID
        result = self.run_python_script(describe_script, changeset_id)
        product_id = self.extract_product_id(result.stdout)
        
        if product_id:
            self.logger.log(f"Product ID: {product_id}")
            self.shared_env['PRODUCT_ID'] = product_id
            self.save_shared_env()
        else:
            self.logger.log("Warning: Could not extract product ID", level="WARN")
        
        return True
    
    def step2_create_private_offer(self):
        """Step 2: Create Private Offer"""
        self.logger.log("\n" + "="*80)
        self.logger.log("STEP 2: Create Private Offer")
        self.logger.log("="*80)
        
        if 'PRODUCT_ID' not in self.shared_env:
            self.logger.log("PRODUCT_ID not found in shared_env.json", level="ERROR")
            return False
        
        script = WORKFLOW_DIR / "2_createPrivateOffer" / "start_changeset.py"
        result = self.run_python_script(script)
        
        if result.returncode != 0:
            self.logger.log("Failed to start private offer creation", level="ERROR")
            return False
        
        # Extract changeset ID
        changeset_id = self.extract_changeset_id(result.stdout)
        if not changeset_id:
            self.logger.log("Could not extract changeset ID", level="ERROR")
            return False
        
        self.logger.log(f"Changeset ID: {changeset_id}")
        self.shared_env['OFFER_CHANGESET_ID'] = changeset_id
        self.save_shared_env()
        
        # Poll for completion
        describe_script = WORKFLOW_DIR / "2_createPrivateOffer" / "describe_changeset.py"
        status = self.poll_changeset_status(changeset_id, describe_script)
        
        if status != "SUCCEEDED":
            return False
        
        # Get offer details
        result = self.run_python_script(describe_script, changeset_id)
        offer_id = self.extract_offer_id(result.stdout)
        
        if offer_id:
            self.logger.log(f"Offer ID: {offer_id}")
            self.shared_env['OFFER_ID'] = offer_id
            
            # Run describe_offer to get offer ARN
            describe_offer_script = WORKFLOW_DIR / "2_createPrivateOffer" / "describe_offer.py"
            result = self.run_python_script(describe_offer_script, offer_id)
            
            # Extract offer ARN from output
            for line in result.stdout.split('\n'):
                if 'EntityArn' in line or 'OfferArn' in line:
                    import re
                    match = re.search(r'arn:aws:aws-marketplace:[^"]+', line)
                    if match:
                        offer_arn = match.group(0)
                        self.logger.log(f"Offer ARN: {offer_arn}")
                        self.shared_env['OFFER_ARN'] = offer_arn
                        break
            
            self.save_shared_env()
        else:
            self.logger.log("Warning: Could not extract offer ID", level="WARN")
        
        return True
    
    def step3_create_opportunity(self):
        """Step 3: Create and Submit Opportunity"""
        self.logger.log("\n" + "="*80)
        self.logger.log("STEP 3: Create and Submit Opportunity")
        self.logger.log("="*80)
        
        base_dir = WORKFLOW_DIR / "3_createOpportunity"
        
        # 3.1: Create opportunity
        self.logger.log("\n--- 3.1: Create Opportunity ---")
        script = base_dir / "1_create_opportunity.py"
        result = self.run_python_script(script)
        
        if result.returncode != 0:
            self.logger.log("Failed to create opportunity", level="ERROR")
            return False
        
        # Extract opportunity ID
        opportunity_id = self.extract_opportunity_id(result.stdout)
        if not opportunity_id or not opportunity_id.startswith('O'):
            self.logger.log("Invalid opportunity ID", level="ERROR")
            return False
        
        self.logger.log(f"Opportunity ID: {opportunity_id}")
        self.shared_env['OPPORTUNITY_ID'] = opportunity_id
        self.save_shared_env()
        
        # 3.2: List solutions
        self.logger.log("\n--- 3.2: List Solutions ---")
        script = base_dir / "2_list_solutions.py"
        result = self.run_python_script(script)
        
        if result.returncode != 0:
            self.logger.log("Failed to list solutions", level="ERROR")
            return False
        
        # 3.3: Associate opportunity
        self.logger.log("\n--- 3.3: Associate Opportunity ---")
        script = base_dir / "3_associate_opportunity.py"
        result = self.run_python_script(script)
        
        if result.returncode != 0:
            self.logger.log("Failed to associate opportunity", level="ERROR")
            return False
        
        # 3.4: Start engagement
        self.logger.log("\n--- 3.4: Start Engagement ---")
        script = base_dir / "4_start_engagement_from_opportunity_task.py"
        result = self.run_python_script(script)
        
        if result.returncode != 0:
            self.logger.log("Failed to start engagement", level="ERROR")
            return False
        
        # 3.5: Simulate AWS approval
        self.logger.log("\n--- 3.5: Simulate AWS Approval ---")
        script = base_dir / "aws_simulate_approval_update_opportunity.py"
        result = self.run_python_script(script)
        
        if result.returncode != 0:
            self.logger.log("Failed to simulate approval", level="ERROR")
            return False
        
        return True
    
    def step4_associate_offer_to_opportunity(self):
        """Step 4: Associate Private Offer to Opportunity"""
        self.logger.log("\n" + "="*80)
        self.logger.log("STEP 4: Associate Private Offer to Opportunity")
        self.logger.log("="*80)
        
        base_dir = WORKFLOW_DIR / "4_associatePrivateOfferToOpportunity"
        
        # 4.1: Associate opportunity
        self.logger.log("\n--- 4.1: Associate Opportunity ---")
        script = base_dir / "associate_opportunity.py"
        result = self.run_python_script(script)
        
        if result.returncode != 0:
            self.logger.log("Failed to associate opportunity", level="ERROR")
            return False
        
        # 4.2: Get opportunity (if script exists)
        get_opp_script = base_dir / "get_opportunity.py"
        if get_opp_script.exists():
            self.logger.log("\n--- 4.2: Get Opportunity ---")
            result = self.run_python_script(get_opp_script)
            
            if result.returncode != 0:
                self.logger.log("Failed to get opportunity", level="ERROR")
                return False
        
        return True
    
    def step5_buyer_accept_offer(self):
        """Step 5: Search for Agreement (Buyer Accepts Offer)"""
        self.logger.log("\n" + "="*80)
        self.logger.log("STEP 5: Search for Agreement")
        self.logger.log("="*80)
        
        if 'OFFER_ID' not in self.shared_env:
            self.logger.log("OFFER_ID not found in shared_env.json", level="ERROR")
            return False
        
        script = WORKFLOW_DIR / "5_buyerAcceptPrivateOffer" / "search_agreements_by_offer_id.py"
        result = self.run_python_script(script, self.shared_env['OFFER_ID'])
        
        if result.returncode != 0:
            self.logger.log("Failed to search agreements", level="ERROR")
            return False
        
        # Check for ACTIVE status
        if 'ACTIVE' in result.stdout or '"Status": "ACTIVE"' in result.stdout:
            self.logger.log("✓ Agreement is ACTIVE", level="SUCCESS")
            return True
        else:
            self.logger.log("Agreement not yet ACTIVE", level="WARN")
            self.logger.log("Note: Buyer needs to accept the offer for agreement to be ACTIVE")
            # Continue anyway for testing purposes
            return True
    
    def step6_update_opportunity_to_committed(self):
        """Step 6: Update Opportunity to Committed"""
        self.logger.log("\n" + "="*80)
        self.logger.log("STEP 6: Update Opportunity to Committed")
        self.logger.log("="*80)
        
        script = WORKFLOW_DIR / "6_updateOpportunity" / "update_opportunity_to_committed.py"
        result = self.run_python_script(script)
        
        if result.returncode != 0:
            self.logger.log("Failed to update opportunity", level="ERROR")
            return False
        
        return True
    
    def run_workflow(self):
        """Run the complete workflow"""
        print("\n" + "="*80)
        print("AWS MARKETPLACE OPPORTUNITY TO OFFER WORKFLOW TEST")
        print("="*80)
        print(f"📝 Log file: {LOG_FILE}")
        print(f"⏰ Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)
        
        self.logger.log("="*80)
        self.logger.log("AWS MARKETPLACE OPPORTUNITY TO OFFER WORKFLOW TEST")
        self.logger.log("="*80)
        self.logger.log(f"Log file: {LOG_FILE}")
        self.logger.log(f"Start time: {datetime.now()}")
        
        steps = [
            ("Create SaaS Product", self.step1_create_product),
            ("Create Private Offer", self.step2_create_private_offer),
            ("Create and Submit Opportunity", self.step3_create_opportunity),
            ("Associate Offer to Opportunity", self.step4_associate_offer_to_opportunity),
            ("Search for Agreement", self.step5_buyer_accept_offer),
            ("Update Opportunity to Committed", self.step6_update_opportunity_to_committed),
        ]
        
        for i, (step_name, step_func) in enumerate(steps, 1):
            print(f"\n{'='*80}")
            print(f"📍 STEP {i}/{len(steps)}: {step_name}")
            print(f"{'='*80}")
            
            try:
                success = step_func()
                if not success:
                    print(f"\n❌ Workflow failed at Step {i}: {step_name}")
                    print(f"📝 Check log file for details: {LOG_FILE}")
                    self.logger.log(f"\n✗ Workflow failed at Step {i}: {step_name}", level="ERROR")
                    self.logger.log(f"Check log file for details: {LOG_FILE}")
                    return False
                else:
                    print(f"\n✅ Step {i} completed successfully")
            except Exception as e:
                print(f"\n❌ Exception in Step {i}: {step_name}")
                print(f"⚠️  Error: {str(e)}")
                self.logger.log(f"\n✗ Exception in Step {i}: {step_name}", level="ERROR")
                self.logger.log(f"Error: {str(e)}", level="ERROR")
                import traceback
                self.logger.log(traceback.format_exc(), level="ERROR")
                return False
        
        print("\n" + "="*80)
        print("🎉 WORKFLOW COMPLETED SUCCESSFULLY!")
        print("="*80)
        print(f"⏰ End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📝 Log file: {LOG_FILE}")
        print(f"💾 Shared environment: {SHARED_ENV_FILE}")
        print("="*80 + "\n")
        
        self.logger.log("\n" + "="*80)
        self.logger.log("✓ WORKFLOW COMPLETED SUCCESSFULLY!", level="SUCCESS")
        self.logger.log("="*80)
        self.logger.log(f"End time: {datetime.now()}")
        self.logger.log(f"Log file: {LOG_FILE}")
        self.logger.log(f"Shared environment: {SHARED_ENV_FILE}")
        
        return True


def main():
    """Main entry point"""
    logger = WorkflowLogger(LOG_FILE)
    executor = WorkflowExecutor(logger)
    
    try:
        success = executor.run_workflow()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.log("\n\nWorkflow interrupted by user", level="WARN")
        sys.exit(130)
    except Exception as e:
        logger.log(f"\n\nUnexpected error: {e}", level="ERROR")
        import traceback
        logger.log(traceback.format_exc(), level="ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()

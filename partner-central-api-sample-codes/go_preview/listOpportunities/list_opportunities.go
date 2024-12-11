// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/partnercentralselling"
)

func main() {
	config, err := config.LoadDefaultConfig(context.TODO())

	if err != nil {
		log.Fatal(err)
	}

	config.Region = "us-east-1"

	client := partnercentralselling.NewFromConfig(config)

	output, err := client.ListOpportunities(context.TODO(), &partnercentralselling.ListOpportunitiesInput{
		MaxResults: aws.Int32(2),
		Catalog:    aws.String("AWS"),
	})

	if err != nil {
		log.Fatal(err)
	}

	jsonOutput, err := json.MarshalIndent(output, "", "    ")
	fmt.Println(string(jsonOutput))
}

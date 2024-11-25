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
	config.BaseEndpoint = aws.String("https://partnercentral-selling.us-east-1.api.aws")

	client := partnercentralselling.NewFromConfig(config)

	output, err := client.ListOpportunities(context.TODO(), &partnercentralselling.ListOpportunitiesInput{
		MaxResults: aws.Int32(20),
		Catalog:    aws.String("AWS"),
	})

	if err != nil {
		log.Fatal(err)
	}

	jsonOutput, err := json.MarshalIndent(output, "", "    ")
	fmt.Println(string(jsonOutput))
}

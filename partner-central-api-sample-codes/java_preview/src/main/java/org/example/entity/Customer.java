// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import java.util.ArrayList;

import com.google.gson.annotations.SerializedName;

public class Customer {
	@SerializedName(value ="Account")
	public Account account;	
	
	@SerializedName(value ="Contacts")
	public ArrayList<Contact> contacts;
}
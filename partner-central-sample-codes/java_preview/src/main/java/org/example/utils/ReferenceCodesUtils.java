// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.utils;

import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.io.IOUtils;
import org.example.UpdatePartnerOriginatedActionRequiredOpportunity;

import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

public class ReferenceCodesUtils {

	public static void formatOutput(Object result) {
		try {
			ObjectMapper om = new ObjectMapper();
			om.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
			om.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);
			om.registerModule(new JavaTimeModule());
			ObjectWriter ow = om.writer().withDefaultPrettyPrinter();

			String json = ow.writeValueAsString(result);
			System.out.println(json);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	}
	
	public static String readInputFileToString (String inputFile) {
		
		InputStream inputStream = UpdatePartnerOriginatedActionRequiredOpportunity.class.getClassLoader().getResourceAsStream(inputFile);

		String input = null;
		
		try {
			input = IOUtils.toString(inputStream, "UTF-8");
		} catch (IOException e) {
			e.printStackTrace();
		}
		return input;
	}
	
	
}

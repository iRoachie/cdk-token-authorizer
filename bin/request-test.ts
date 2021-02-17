#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RequestTestStack } from '../lib/request-test-stack';

const app = new cdk.App();
new RequestTestStack(app, 'api-gateway-request');

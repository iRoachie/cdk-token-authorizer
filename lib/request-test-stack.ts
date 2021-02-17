import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { CustomHttpApi } from './api/CustomApi';

export class RequestTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authlambda = new Function(this, 'auth-function', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(__dirname + '/auth-lambda'),
      handler: 'index.handler',
    });

    const api = new CustomHttpApi(this, 'api', {
      lambdaAuthorizerArn: authlambda.functionArn,
    });

    const lambda = new Function(this, 'protected-lambda', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(__dirname + '/protected-lambda'),
      handler: 'index.handler',
    });

    api.addLambdaRoute({
      lambdaFn: lambda,
      method: HttpMethod.GET,
      protected: true,
      path: '/',
    });
  }
}

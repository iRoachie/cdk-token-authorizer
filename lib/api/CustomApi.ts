import {
  CfnAuthorizer,
  HttpApi,
  HttpApiProps,
  HttpMethod,
  HttpRouteKey,
  PayloadFormatVersion,
} from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Function } from '@aws-cdk/aws-lambda';
import { Construct, Duration } from '@aws-cdk/core';
import { HttpRoute } from './Route';

interface CustomHttpApiProps extends HttpApiProps {
  region?: string;
  lambdaAuthorizerArn: string;
}

export class CustomHttpApi extends HttpApi {
  public readonly authorizer: CfnAuthorizer;

  constructor(scope: Construct, id: string, props?: CustomHttpApiProps) {
    const region = props?.region || 'us-east-1';
    const lambdaAuthorizerUri = `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${props?.lambdaAuthorizerArn}/invocations`;

    // ========================================================================
    // Resources: HTTP API
    // ========================================================================
    // Initialization
    super(scope, id, {
      description: props?.description,
      apiName: props?.apiName,
    });

    // ========================================================================
    // Resources: HTTP Authorizer
    // ========================================================================
    this.authorizer = new CfnAuthorizer(this, 'lambda-header-authorizer', {
      apiId: this.httpApiId,
      authorizerPayloadFormatVersion: '2.0',
      authorizerType: 'REQUEST',
      authorizerUri: lambdaAuthorizerUri,
      identitySource: [],
      name: 'token-authorizer',
      enableSimpleResponses: true,
    });
  }

  public addLambdaRoute(props: {
    lambdaFn: Function;
    method: HttpMethod;
    path: string;
    protected: boolean;
  }) {
    //  Step 1: Add the Lambda Handler Proxy Integration
    const integration = new LambdaProxyIntegration({
      handler: props.lambdaFn,
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
    });

    // Step 2: Add the Route
    new HttpRoute(this, `route-lambda-${props.lambdaFn.node.id}`, {
      httpApi: this,
      integration: integration,
      routeKey: HttpRouteKey.with(props.path, props.method),
      ...(props.protected
        ? {
            authorizerType: 'CUSTOM',
            authorizerId: this.authorizer.ref,
          }
        : {}),
    });
  }
}

import {
  CfnRoute,
  CfnRouteProps,
  HttpRouteProps as BaseHttpRouteProps,
  IHttpApi,
  IHttpRoute,
} from '@aws-cdk/aws-apigatewayv2';
import { Construct, Resource } from '@aws-cdk/core';

interface HttpRouteProps extends BaseHttpRouteProps {
  authorizerId?: string;
  authorizerType?: string;
}

export class HttpRoute extends Resource implements IHttpRoute {
  public readonly routeId: string;
  public readonly httpApi: IHttpApi;
  public readonly path?: string;

  constructor(scope: Construct, id: string, props: HttpRouteProps) {
    super(scope, id);

    this.httpApi = props.httpApi;
    this.path = props.routeKey.path;

    const config = props.integration.bind({
      route: this,
      scope: this,
    });

    const integration = props.httpApi._addIntegration(config);

    const routeProps: CfnRouteProps = {
      apiId: props.httpApi.httpApiId,
      routeKey: props.routeKey.key,
      target: `integrations/${integration.integrationId}`,
      authorizerId: props.authorizerId,
      authorizationType: props.authorizerType,
    };

    const route = new CfnRoute(this, 'Resource', routeProps);
    this.routeId = route.ref;
  }
}

import { ApolloLink } from "@apollo/client/core";
import { createHttpLink } from "@apollo/client/link/http";
import { getMainDefinition } from "@apollo/client/utilities";

import type { OperationDefinitionNode } from "graphql";

const CONTROL_EVENTS_KEY = '@@controlEvents';

import {
  AppSyncRealTimeSubscriptionHandshakeLink,
} from "./realtime-subscription-handshake-link";
import { AppSyncRealTimeSubscriptionConfig } from "./types";

function createSubscriptionHandshakeLink(
  args: AppSyncRealTimeSubscriptionConfig,
  resultsFetcherLink?: ApolloLink
): ApolloLink;
function createSubscriptionHandshakeLink(
  infoOrUrl: AppSyncRealTimeSubscriptionConfig,
  theResultsFetcherLink?: ApolloLink
) {
  let resultsFetcherLink: ApolloLink, subscriptionLinks: ApolloLink;

  const { url } = infoOrUrl;
  resultsFetcherLink = theResultsFetcherLink || createHttpLink({ uri: url });
  subscriptionLinks = new AppSyncRealTimeSubscriptionHandshakeLink(infoOrUrl);


  return ApolloLink.split(
    operation => {
      const { query } = operation;
      const { kind, operation: graphqlOperation } = getMainDefinition(
        query
      ) as OperationDefinitionNode;
      const isSubscription =
        kind === "OperationDefinition" && graphqlOperation === "subscription";

      return isSubscription;
    },
    subscriptionLinks,
    resultsFetcherLink
  );
}

export { CONTROL_EVENTS_KEY, createSubscriptionHandshakeLink };

import * as k8s from "@kubernetes/client-node"
import * as kubectlHelper from "./lib/kubectl"
import * as helper from "./lib/helper"

async function listAllIngresses(context: string, namespace: string) {
  console.log(`Listing all ingresses on cluster: ${context}, namespace: ${namespace}`)
  const k8sApi = helper.kubeNetworkingClient(context);

  const ingresses = await k8sApi.listNamespacedIngress({ namespace });

  console.log(`Found ${ingresses.items.length} ingresses:`);
  ingresses.items.forEach(ingress => {
    // console.log(`- Name: ${ingress.metadata?.name}`)
    ingress.spec?.rules?.forEach(rule => {
      console.log(`- Host: ${rule.host}`)
    })
  })
}

const { context, namespace } = helper.parseArgs();

listAllIngresses(context, namespace).catch(err => {
  console.error('Error fetching ingresses:', err);
});
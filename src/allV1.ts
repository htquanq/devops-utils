import * as helper from "./lib/helper"
import * as yaml from "js-yaml"

async function getResources(context: string, namespace: string, kind: string) {
  console.log(`Getting all ${kind} on cluster: ${context}, namespace: ${namespace}`)
  
  const resourceMap: Record<string, { client: Function, list: Function, folder: string, apiVersion: string, getSpec: Function }> = {
    "Service": {
      client: () => helper.kubeCoreClient(context),
      list: (api: any) => api.listNamespacedService({namespace}),
      folder: "services",
      apiVersion: "v1",
      getSpec: (item: any) => ({ spec: item.spec })
    },
    "ConfigMap": {
      client: () => helper.kubeCoreClient(context),
      list: (api: any) => api.listNamespacedConfigMap({namespace}),
      folder: "configmaps",
      apiVersion: "v1",
      getSpec: (item: any) => ({ data: item.data })
    },
    "Secret": {
      client: () => helper.kubeCoreClient(context),
      list: (api: any) => api.listNamespacedSecret({namespace}),
      folder: "secrets",
      apiVersion: "v1",
      getSpec: (item: any) => ({ data: item.data })
    },
    "PersistentVolumeClaim": {
      client: () => helper.kubeCoreClient(context),
      list: (api: any) => api.listNamespacedPersistentVolumeClaim({namespace}),
      folder: "pvcs",
      apiVersion: "v1",
      getSpec: (item: any) => ({ spec: item.spec })
    },
    // "PersistentVolume": {
    //   client: () => helper.kubeCoreClient(context),
    //   list: (api: any) => api.listPersistentVolume(), // Note: PVs are cluster-scoped, not namespaced
    //   folder: "pvs",
    //   apiVersion: "v1",
    //   getSpec: (item: any) => ({ spec: item.spec })
    // },
    "Deployment": {
      client: () => helper.kubeAppsClient(context),
      list: (api: any) => api.listNamespacedDeployment({namespace}),
      folder: "deployments",
      apiVersion: "apps/v1",
      getSpec: (item: any) => ({ spec: item.spec })
    },
    "DaemonSet": {
      client: () => helper.kubeAppsClient(context),
      list: (api: any) => api.listNamespacedDaemonSet({namespace}),
      folder: "daemonsets",
      apiVersion: "apps/v1",
      getSpec: (item: any) => ({ spec: item.spec })
    },
    "StatefulSet": {
      client: () => helper.kubeAppsClient(context),
      list: (api: any) => api.listNamespacedStatefulSet({namespace}),
      folder: "statefulsets",
      apiVersion: "apps/v1",
      getSpec: (item: any) => ({ spec: item.spec })
    },
    "Ingress": {
      client: () => helper.kubeNetworkingClient(context),
      list: (api: any) => api.listNamespacedIngress({namespace}),
      folder: "ingresses",
      apiVersion: "networking.k8s.io/v1",
      getSpec: (item: any) => ({ spec: item.spec })
    },
    "NetworkPolicy": {
      client: () => helper.kubeNetworkingClient(context),
      list: (api: any) => api.listNamespacedNetworkPolicy({namespace}),
      folder: "networkpolicies",
      apiVersion: "networking.k8s.io/v1",
      getSpec: (item: any) => ({ spec: item.spec })
    }
  };

  const resource = resourceMap[kind];
  if (!resource) {
    console.error(`Resource type ${kind} not supported`);
    return;
  }

  const k8sClient = resource.client();
  const items = await resource.list(k8sClient);
  
  for (const item of items.items) {
    const name = item.metadata?.name || 'unknown';
    
    // For PVs, which are cluster-scoped, we'll organize them differently
    const folderPath = kind === "PersistentVolume" 
      ? `${context}/cluster-resources/${resource.folder}`
      : `${context}/${namespace}/${resource.folder}`;
    
    const manifest = {
      apiVersion: resource.apiVersion,
      kind,
      metadata: {
        name: item.metadata?.name,
        namespace: item.metadata?.namespace, // This will be undefined for PVs
        labels: item.metadata?.labels,
        annotations: item.metadata?.annotations
      },
      ...resource.getSpec(item)
    };

    // Remove undefined namespace for cluster-scoped resources
    if (!manifest.metadata.namespace) {
      delete manifest.metadata.namespace;
    }

    const yamlContent = yaml.dump(manifest, { noRefs: true, sortKeys: true });
    helper.writeYaml(folderPath, `${name}.yaml`, yamlContent);
  }
}

const { context, namespace } = helper.parseArgs();

async function getAllWorkloads(context: string, namespace: string) {
  await Promise.all([
    // Core resources
    getResources(context, namespace, "Service"),
    getResources(context, namespace, "ConfigMap"),
    getResources(context, namespace, "Secret"),
    getResources(context, namespace, "PersistentVolumeClaim"),
    //getResources(context, namespace, "PersistentVolume"), // Note: PVs are cluster-scoped
    // Apps resources
    getResources(context, namespace, "Deployment"),
    getResources(context, namespace, "DaemonSet"),
    getResources(context, namespace, "StatefulSet"),
    // Networking resources
    getResources(context, namespace, "Ingress"),
    getResources(context, namespace, "NetworkPolicy")
  ]);
}

getAllWorkloads(context, namespace).catch(err => {
  console.error('Error fetching workloads:', err);
});
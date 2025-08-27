import * as kubectlHelper from "./lib/kubectl"
import * as helper from "./lib/helper"

async function getEverything(context: string, namespace: string){
  console.log(`Getting resources on cluster: ${context}, namespace: ${namespace}`)
  await getTotalRequestsAndLimits(context, namespace);
  await getPVC(context, namespace);
}

async function getTotalRequestsAndLimits(context: string, namespace: string) {

  // Create API client for interacting with K8s server
  const k8sApi = helper.kubeCoreClient(context);

  // list all pods in target namespace
  const pods = await k8sApi.listNamespacedPod({namespace});

  let memRequest = 0;
  let memLimit = 0;
  let cpuRequest = 0;
  let cpuLimit = 0;

  for (const pod of pods.items) {
    for (const container of pod.spec?.containers || []) {
      const requests = container.resources?.requests || {};
      const limits = container.resources?.limits || {};

      cpuRequest += kubectlHelper.parseResourceQuantity(requests['cpu']);
      cpuLimit += kubectlHelper.parseResourceQuantity(limits['cpu']);
      memRequest += kubectlHelper.parseResourceQuantity(requests['memory']);
      memLimit += kubectlHelper.parseResourceQuantity(limits['memory']);
    }
  }

  console.log(`Total CPU Requests: ${cpuRequest} cores`);
  console.log(`Total CPU Limits:   ${cpuLimit} cores`);
  console.log(`Total Memory Requests: ${memRequest / (1024 * 1024)} Mi`);
  console.log(`Total Memory Limits:   ${memLimit / (1024 * 1024)} Mi`);
}

async function getPVC(context: string, namespace: string) {
  const k8sApi = helper.kubeCoreClient(context);

  // list all PVC in target namespaces
  const pvcs = await k8sApi.listNamespacedPersistentVolumeClaim({namespace});

  let pvcStorage = 0;
  for (const pvc of pvcs.items) {
    const storage = pvc.spec?.resources?.requests?.['storage'];
    pvcStorage += kubectlHelper.parseResourceQuantity(storage);
  }

  console.log(`Total PVC: ${pvcStorage / (1024 * 1024)} Mi`)
}

const { context, namespace } = helper.parseArgs();

getEverything(context, namespace).catch(err => {
  console.error('Error fetching pod data:', err);
});
import * as k8s from "@kubernetes/client-node"
import * as path from "path"
import * as fs from "fs"

export function parseArgs(): { context: string; namespace: string } {
  const args = process.argv.slice(2);
  let context = '';
  let namespace = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--context=')) {
      context = args[i].split('=')[1];
    } else if (args[i].startsWith('--namespace=')) {
      namespace = args[i].split('=')[1];
    }
  }

  if (!context || !namespace) {
    console.error('Usage: npx ts-node src/totalResouces.ts --context=<context> --namespace=<namespace>');
    process.exit(1);
  }

  return { context, namespace };
}

// Generic function with overloads
export function kubeClient<T extends k8s.CoreV1Api | k8s.AppsV1Api | k8s.BatchV1Api | k8s.NetworkingV1Api>(
  contextName?: string, 
  apiKind?: string
): T {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  if (contextName) {
    kc.setCurrentContext(contextName);
    console.log(`=> Using context: ${contextName}`);
  } else {
    console.log(`🧠 Using default context: ${kc.getCurrentContext()}`);
  }

  switch (apiKind) {
    case "app":
      return kc.makeApiClient(k8s.AppsV1Api) as T;
    case "networking":
      return kc.makeApiClient(k8s.NetworkingV1Api) as T;
    case "batch":
      return kc.makeApiClient(k8s.BatchV1Api) as T;
    default:
      return kc.makeApiClient(k8s.CoreV1Api) as T;
  }
}

// Convenience functions that match what you're using in other files
export function kubeCoreClient(contextName?: string): k8s.CoreV1Api {
  return kubeClient<k8s.CoreV1Api>(contextName);
}

export function kubeNetworkingClient(contextName?: string): k8s.NetworkingV1Api {
  return kubeClient<k8s.NetworkingV1Api>(contextName, "networking");
}

export function kubeAppsClient(contextName?: string): k8s.AppsV1Api {
  return kubeClient<k8s.AppsV1Api>(contextName, "app");
}

export function kubeBatchClient(contextName?: string): k8s.BatchV1Api {
  return kubeClient<k8s.BatchV1Api>(contextName, "batch");
}

export function writeYaml(filePath: string, fileName: string, content: string) {
  // Create output directory
  const outputDir = path.join(process.cwd(), `outputs/${filePath}`);
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(`${outputDir}/${fileName}`, content);
}
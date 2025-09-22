# DevOps Utils

# Get K8s resources requests and limits of one namespace
```shell
npx ts-node src/totalResouces.ts --context=<context_name> --namespace=<namespace>
```

Output:
```shell
Getting resources on cluster: xxxx, namespace: xxxxx
=> Using context: xxxx
Total CPU Requests: 2.45 cores
Total CPU Limits:   33 cores
Total Memory Requests: 14080 Mi
Total Memory Limits:   14080 Mi
=> Using context: xxx
Total PVC: 8192 Mi
```

# Get K8s resources(deployments, statefulsets, ingresses, etc) of one namespace and output to YAML files
```shell
npx ts-node src/allV1.ts --context=<context_name> --namespace=<namespace>
```
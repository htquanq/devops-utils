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
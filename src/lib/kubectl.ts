export function parseResourceQuantity(quantity: string | undefined): number {
  if (!quantity) return 0;

  if (quantity.endsWith('m')) {
    return parseInt(quantity.slice(0, -1), 10) / 1000;
  } else if (quantity.endsWith('Ki')) {
    return parseInt(quantity.slice(0, -2), 10) * 1024;
  } else if (quantity.endsWith('Mi')) {
    return parseInt(quantity.slice(0, -2), 10) * 1024 * 1024;
  } else if (quantity.endsWith('Gi')) {
    return parseInt(quantity.slice(0, -2), 10) * 1024 * 1024 * 1024;
  } else if (quantity.endsWith('n')) {
    return parseInt(quantity.slice(0, -1), 10) / 1e9;
  } else if (quantity.endsWith('u')) {
    return parseInt(quantity.slice(0, -1), 10) / 1e6;
  }

  return parseFloat(quantity); // assume cores or bytes
}
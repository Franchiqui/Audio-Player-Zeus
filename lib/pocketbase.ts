import PocketBase from 'pocketbase';

// Initialize PocketBase client
// Replace with your PocketBase server URL
export const pb = new PocketBase('http://localhost:8090');

// Disable auto-cancelation for long-running requests
pb.autoCancellation(false);

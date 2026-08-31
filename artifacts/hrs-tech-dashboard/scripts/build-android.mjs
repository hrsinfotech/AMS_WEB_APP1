#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Building HRS Tech AMS for Android...\n');

try {
  // Build web assets
  console.log('📦 Building web assets...');
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });

  // Check if android directory exists, if not initialize Capacitor
  const androidDir = path.join(projectRoot, 'android');
  if (!existsSync(androidDir)) {
    console.log('\n📱 Initializing Capacitor Android project...');
    execSync('npx cap add android', { cwd: projectRoot, stdio: 'inherit' });
  }

  // Sync Capacitor
  console.log('\n🔄 Syncing Capacitor...');
  execSync('npx cap sync android', { cwd: projectRoot, stdio: 'inherit' });

  // Build APK
  console.log('\n🛠️ Building Android APK (release)...');
  const gradleDir = path.join(projectRoot, 'android');
  
  if (process.platform === 'win32') {
    execSync('gradlew.bat assembleRelease', { cwd: gradleDir, stdio: 'inherit' });
  } else {
    execSync('./gradlew assembleRelease', { cwd: gradleDir, stdio: 'inherit' });
  }

  console.log('\n✅ Android APK build completed successfully!');
  console.log(`📱 APK location: ${path.join(gradleDir, 'app/build/outputs/apk/release/')}`);
  console.log('\n📋 Next steps:');
  console.log('  1. Transfer APK to Android device');
  console.log('  2. Enable "Unknown Sources" in Android Settings');
  console.log('  3. Install the APK: adb install -r <apk-file>');
  console.log('  4. Launch "HRS Tech AMS" from your app drawer\n');

} catch (error) {
  console.error('\n❌ Android build failed:', error.message);
  process.exit(1);
}

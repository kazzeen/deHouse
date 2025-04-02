// This file contains the build script for the deHouse website
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// Check if build directory exists, create if not
const buildDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Log build start
console.log('Starting build process for deHouse...');

// Copy assets to build directory
const assetsDir = path.resolve(__dirname, 'src/assets');
const buildAssetsDir = path.resolve(buildDir, 'assets');

if (!fs.existsSync(buildAssetsDir)) {
  fs.mkdirSync(buildAssetsDir);
}

// Copy all SVG files
const svgFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.svg'));
svgFiles.forEach(file => {
  fs.copyFileSync(path.resolve(assetsDir, file), path.resolve(buildAssetsDir, file));
  console.log(`Copied ${file} to build directory`);
});

// Run webpack build
console.log('Running webpack build...');

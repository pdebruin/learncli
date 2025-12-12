#!/usr/bin/env node

const args = process.argv.slice(2);
const firstParam = args[0];

if (firstParam === "docs") {
  console.log("hello docs");
} else if (firstParam === "code") {
  console.log("hello code");
} else {
  console.log("Please provide a first parameter: 'docs' or 'code'");
}

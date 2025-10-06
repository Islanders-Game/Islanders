import { $ } from 'bun';
$`rm -rf dist/public/**/*`;
$`cp -R public dist/`;

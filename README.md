# Sao ke reader

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## What does it do

A tool to read and compile all entries from .CSV statement files download from VPBank account management page.
With partial support for Vietinbank statement file.

## Loading files:
- Save all files into a folder, and click top left button to load the entire folder
- Files from different accounts can be added into their corresponding sub-folder
- VPBank files can be used as is
## Using Vietinbank file:
- using a CSV editor, remove all '+' symbols
- save file as a Tab Separated Values file, with "vietin" including somewhere in the name
- using a text editor, like VSCode, replacing all 'Tab' character with '|' character
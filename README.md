This project was build on Storybook template provided by Chroma Software Inc.

# Project Instructions

## Getting Started

To set up the project, first install the necessary dependencies:

```bash
npm install
```

## Project Structure

The different pages of the website are located in the following files:

- `src/FormPage.jsx`
- `src/SpawnPending.jsx`
- `src/NotRunning.jsx`
- `src/LoginPage.jsx`
- `src/HomePage.jsx`

## Running the Project in Development Mode

You can run individual pages in a development environment using the following commands:

- For `FormPage.jsx`:
  ```bash
  npm run dev:form
  ```
- For `SpawnPending.jsx`:
  ```bash
  npm run dev:spawn_p
  ```
- For `LoginPage.jsx`:
  ```bash
  npm run dev:login
  ```
- For `NotRunning.jsx`:
  ```bash
  npm run dev:not_running
  ```
- For `HomePage.jsx`:
  ```bash
  npm run dev:home
  ```

## Component Development with Storybook

For component development, you can start a Storybook environment:

```bash
npm run storybook
```

## Building the Project

To build the project for production, use the following command:

```bash
npm run build:{build_target}
```

## Creating ConfigMaps

If you want to create ConfigMaps from the built project, use the `create_config_maps.sh` script. Before running it, make sure it is executable:

```bash
chmod +x create_config_maps.sh
```

You can also modify the script if you only want to generate files locally instead of applying them to a Kubernetes cluster.
Then execute the script:

```bash
./create_config_maps.sh {build_target} or {namespace}
```



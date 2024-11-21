# aws-region-utils

`aws-region-utils` is a utility library for working with AWS regions. It provides functions to calculate distances, sort regions by proximity, and more. This package is designed to help developers easily work with AWS region data in geospatial contexts.

## Features

-   **Sort AWS Regions by Distance**: Calculate and sort AWS regions based on their distance from the user's current geolocation (needs user consent for location access).
-   **Extensible and Modular**: More utility functions will be added in future updates.
-   **TypeScript Support**: Fully typed with TypeScript for better developer experience and safety.

## Installation

Install the package via npm:

```bash
npm install aws-region-utils
```

## Usage

### Current Functionality

#### Get all AWS Regions

```typescript
import { awsRegions } from 'aws-region-utils';

const regions = awsRegions();
console.log('AWS Regions:', regions);
```

#### Sorting AWS Regions by Distance

You can use the awsRegionsByDistance function to sort AWS regions by their distance from the user's location:

```typescript
import { awsRegionsByDistance } from 'aws-region-utils';

awsRegionsByDistance()
    .then((regions) => {
        console.log('Sorted AWS Regions by Distance:', regions);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
```

### More Features Coming Soon!

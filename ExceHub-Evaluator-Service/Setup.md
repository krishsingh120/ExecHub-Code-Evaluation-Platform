## How to setup a new Typescript Express project

1. 
```
npm init -y
```

2. 
```
npm install -D typescript
npm install concurrently

```

3. 
```
tsc --init
```

4. Add the following scripts in package.json

```
{
    "build": "npx tsc",
    "watch": "npx tsc -w",
    "prestart": "npm run build",
    "start": "npx nodemon dist/index.js",
    "dev": "npx concurrently --kill-others \"npm run watch\" \"npm start\""
}

```

Note: Make relevant config changes in tsconfig.json

5. 
```
npm run dev
```



6. This tsconfig.json file is used
```
{
    "compilerOptions": {
        /* === File Layout === */
        "rootDir": "./src",
        "outDir": "./dist",

        /* === Environment Settings === */
        "target": "ES2020",
        "module": "Node16",
        "moduleResolution": "node16",
        "lib": ["ES2020"],
        "types": ["node"],

        /* === Output Settings === */
        "sourceMap": true,
        "declaration": true,
        "declarationMap": true,

        /* === Type Checking === */
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "strictFunctionTypes": true,
        "noUncheckedIndexedAccess": true,
        "exactOptionalPropertyTypes": true,
        "noUnusedLocals": false,
        "noUnusedParameters": true,

        /* === Module & Import Behavior === */
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "skipLibCheck": true,

        /* === Optional (for stability & speed) === */
        "isolatedModules": false,
        "moduleDetection": "force"
    },
    "include": ["./src/**/*.ts"],
    "exclude": ["node_modules"]
}


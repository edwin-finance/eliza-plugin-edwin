# @elizaos/plugin-edwin

Edwin plugin for Eliza that enables interaction with Edwin tools for DeFi operations.

## Setup

1. Clone an eliza agent and install dependencies.
2. In the eliza packages directory, clone the eliza-plugin-edwin package.
3. Add the plugin to your character configuration:

```json
{
    "plugins": ["@elizaos/plugin-edwin"],
}
```

## Available Tools

The plugin provides access to the following Edwin tools:

## Usage Examples

1. Get wallet details:

```
Can you show me my wallet details?
```

2. Supply on AAVE:

```
Supply 100 USDC to AAVE
```

3. Stake on Lido:

```
Stake 100 USDC on Lido
```

## Development

1. Build the plugin:

```bash
pnpm build
```

2. Run in development mode:

```bash
pnpm dev
```

## Dependencies

-   edwin-sdk

## License

MIT

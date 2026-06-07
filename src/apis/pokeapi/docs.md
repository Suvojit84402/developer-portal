# Getting Started with PokéAPI

Welcome to the PokéAPI developer documentation. This guide will help you make your first API call in minutes.

## Authentication

PokéAPI is a free, open RESTful API — no authentication is required for read operations. For sandbox testing in this portal, your session token is automatically injected when logged in.

## Base URL

```
https://pokeapi.co/api/v2
```

## Quick Start

### Fetch a Pokémon by name

```bash
curl https://pokeapi.co/api/v2/pokemon/pikachu
```

### Fetch a paginated list

```bash
curl "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0"
```

## Rate Limits

PokéAPI is a fair-use API. Avoid aggressive polling and cache responses where possible. The portal sandbox displays rate-limit headers when available.

## Common Use Cases

1. **Lookup by name or ID** — Use `/pokemon/{idOrName}` with either a numeric ID or lowercase name.
2. **Browse types** — Use `/type/{idOrName}` to explore type effectiveness data.
3. **Evolution chains** — Use `/evolution-chain/{id}` to map Pokémon evolution trees.

## SDKs & Libraries

See the SDK links section for community-maintained wrappers in JavaScript, Python, and more.

## Support

- Documentation: [https://pokeapi.co/docs/v2](https://pokeapi.co/docs/v2)
- GitHub: [https://github.com/PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi)

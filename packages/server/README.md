# Server

## Local Development

From the root:
```
./scripts/run-stores.sh
```

Then from this directory:
```
bun dev
```

## DB

Generate code like this:
```
bun prisma generate
```

Create a new migration like this:
```
bun prisma migrate dev -n 'add_table'
```

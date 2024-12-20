
Generate a new valid JWT Key with Over18 = true, and then sign it with https://jwt.io/
Then try hitting your server with the following curl command:

```
curl --location 'http://localhost:4000/verify-token' \
--header 'Accept: */*' \
--header 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8,bg;q=0.7' \
--header 'Cache-Control: no-cache' \
--header 'Connection: keep-alive' \
--header 'Content-Type: application/json' \
--header 'DNT: 1' \
--header 'Origin: http://localhost:4000' \
--header 'Pragma: no-cache' \
--header 'Referer: http://localhost:4000/' \
--header 'Sec-Fetch-Dest: empty' \
--header 'Sec-Fetch-Mode: cors' \
--header 'Sec-Fetch-Site: same-origin' \
--header 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' \
--header 'sec-ch-ua: "Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'sec-ch-ua-platform: "macOS"' \
--data '{"token":"eyJhbGciOiJSUzI1NiJ9.eyJ1c2VySWQiOiJjYWQ1YjYyZDFhOTdhZWQwNzA3OTI2MmE4MDUxOWE3ZWZkMzY4YzNiM2JjMzY3OGE3YzEwMWI1Mzg3MTk4MGMzIiwiaXNPdmVyMTgiOnRydWUsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJ9.i57vnAxqMdMG5Bnog6FIUAAIslArYm1L2t4O3mlBdv7ZDVpvGpQF8k7PMiCZaeaZlFAa_VcwQdUQoiVOl_0LYxWNgEuhuYZ5pbclS0Wfif6b_aSyvIuiZwcNRlO8Kf_9X31wdjC0Wc0SEUrGIQZoBF0ZIuU4Kk-TKaxdYOyBcLdbq3VAzBUfQrTcsLRX8r_DUHa3vdqa7wryeeeK2wmzbizuMN2KcfZqcQUZMY7S5gZopO-T4u-XAm1Hn0PsK1eKHFOn2kyBgvR-fTwN3WfRhKsg7iF5uGJrRUYw99y8bYceu-0A1tmEQk3xpsROL1y2c9-940VRPUDx73Fl9v3EyA"}'
```

If the private key does not match the one set on the trusted accounts server,
the server will return the access denied page.
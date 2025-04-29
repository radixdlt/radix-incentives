#!/bin/bash
set -e

psql "postgresql://postgres:password@localhost:5432/postgres" -c 'CREATE DATABASE "radix-incentives";' || true
psql "postgresql://postgres:password@localhost:5432/postgres" -c 'CREATE DATABASE "radix-consultation";' || true

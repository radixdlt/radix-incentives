#!/bin/bash
set -e

# psql "postgresql://postgres:password@localhost:5432/radix-consultation" -c 'CREATE DATABASE "dashboard";' || true

psql "postgresql://postgres:password@localhost:5432/radix-consultation" -c 'CREATE SCHEMA IF NOT EXISTS "public";' || true


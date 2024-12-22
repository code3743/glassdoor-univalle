/// <reference types="astro/client" />
declare namespace App {
    interface Locals {
       token: string | null | undefined;
       user: {
           name: string | null;
           id: string;
       } | null | undefined;
    }
}
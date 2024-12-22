import type { APIContext } from "astro";
import ENDPOINTS from "../../config/config";


export async function POST(context: APIContext): Promise<Response> {
	const formData = await context.request.formData();
    const token = context.cookies.get("token")?.value;
	const name = formData.get("alias");
    const response = await fetch(ENDPOINTS.UPDATE_USER, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            name
        }),
    });
    
   
    return response;
}


export async function GET(context: APIContext): Promise<Response> {
    const token = context.cookies.get("token")?.value;
    const response = await fetch(ENDPOINTS.USER, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }});
    const data = await response.json();
    if (response.ok){     
        await fetch(ENDPOINTS.CURRENT_TEACHERS,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );   
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `user=${JSON.stringify(data)}; HttpOnly; Path=/; SameSite=Strict;`,
            },
        });
    }

    return new Response(JSON.stringify(data), {
        status: response.status
    });
}
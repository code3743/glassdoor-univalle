import type { APIContext } from "astro";
import ENDPOINTS from "../../config/config";

export async function POST(context: APIContext): Promise<Response> {

    const formData = await context.request.formData();
    const token = context.cookies.get("token")?.value;
    const teacher_id = formData.get("teacher_id");
    const rating = formData.get("rating");
    const comment = formData.get("comment");

    const response = await fetch(ENDPOINTS.EVALUATE_TEACHER, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            teacher_subject_id: teacher_id,
            rating,
            comment
        }),
    });


   return response;
}
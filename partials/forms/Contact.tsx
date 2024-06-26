"use client";

import React, { useState } from "react";

import { Box, Button, Center, Grid, GridCol, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import { IconCheck, IconX } from "@tabler/icons-react";

import text from "@/handlers/validators/form/special/text";
import email from "@/handlers/validators/form/special/email";
import phone from "@/handlers/validators/form/special/phone";
import capitalize from "@/handlers/parsers/string/capitalize";

import request from "@/hooks/request";

import { typeContact } from "@/types/form";

export default function Contact() {
	const [submitted, setSubmitted] = useState(false);

	const form = useForm({
		initialValues: {
			fname: "",
			lname: "",
			email: "",
			phone: "",
			subject: "",
			message: "",
		},

		validate: {
			fname: value => text(value, 2, 24),
			lname: value => text(value, 2, 24),
			email: value => email(value),
			phone: value => value.trim().length > 0 && phone(value),
			subject: value => text(value, 3, 255),
			message: value => text(value, 3, 2048),
		},
	});

	const parse = (rawData: typeContact) => {
		return {
			fname: capitalize.word(rawData.fname.trim()),
			lname: capitalize.word(rawData.lname.trim()),
			email: rawData.email.trim().toLowerCase(),
			phone: rawData.phone?.trim() ? (rawData.phone.trim().length > 0 ? rawData.phone : null) : null,
			subject: capitalize.words(rawData.subject.trim()),
			message: rawData.message.trim(),
		};
	};

	const handleSubmit = async (formValues: typeContact) => {
		if (form.isValid()) {
			try {
				setSubmitted(true);

				await request
					.post("http://localhost:3000/api/contact", {
						method: "POST",
						body: JSON.stringify(parse(formValues)),
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
						},
					})
					.then(res => {
						if (!res) {
							notifications.show({
								id: "form-contact-failed-no-response",
								icon: <IconX size={16} stroke={1.5} />,
								autoClose: 5000,
								title: "Server Unavailable",
								message: `There was no response from the server.`,
								variant: "failed",
							});
						} else {
							notifications.show({
								id: "form-contact-success",
								icon: <IconCheck size={16} stroke={1.5} />,
								autoClose: 5000,
								title: "Form Submitted",
								message: "Someone will get back to you within 24 hours",
								variant: "success",
							});
						}
					});
			} catch (error) {
				notifications.show({
					id: "form-contact-failed",
					icon: <IconX size={16} stroke={1.5} />,
					autoClose: 5000,
					title: "Submisstion Failed",
					message: (error as Error).message,
					variant: "failed",
				});
			} finally {
				form.reset();
				setSubmitted(false);
			}
		}
	};

	return (
		<Box component="form" onSubmit={form.onSubmit(values => handleSubmit(values))} noValidate>
			<Grid pb={"md"}>
				<GridCol span={{ base: 12, xs: 6 }}>
					<TextInput required placeholder="First Name" {...form.getInputProps("fname")} />
				</GridCol>
				<GridCol span={{ base: 12, xs: 6 }}>
					<TextInput required placeholder="Last Name" {...form.getInputProps("lname")} />
				</GridCol>
				<GridCol span={{ base: 12, sm: 6 }}>
					<TextInput required placeholder="Email" {...form.getInputProps("email")} />
				</GridCol>
				<GridCol span={{ base: 12, sm: 6 }}>
					<TextInput placeholder="Phone" {...form.getInputProps("phone")} />
				</GridCol>
				<GridCol span={12}>
					<TextInput required placeholder="Inquiry" {...form.getInputProps("subject")} />
				</GridCol>
				<GridCol span={12}>
					<Textarea
						required
						placeholder="Message"
						autosize
						minRows={5}
						maxRows={10}
						{...form.getInputProps("message")}
					/>
				</GridCol>
				<GridCol span={12}>
					<Grid mt={"md"}>
						<GridCol span={{ base: 12, xs: 6 }}>
							<Center>
								<Button
									fullWidth
									type="reset"
									color="priLight.8"
									variant="outline"
									onClick={() => form.reset()}
									disabled={submitted}
								>
									Clear
								</Button>
							</Center>
						</GridCol>
						<GridCol span={{ base: 12, xs: 6 }}>
							<Center>
								<Button fullWidth type="submit" color="secLight.7" loading={submitted}>
									{submitted ? "Submitting" : "Submit"}
								</Button>
							</Center>
						</GridCol>
					</Grid>
				</GridCol>
			</Grid>
		</Box>
	);
}

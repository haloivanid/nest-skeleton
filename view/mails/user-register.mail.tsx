import * as React from 'react';
import { Body, Container, Head, Heading, Hr, Html, Link, Section, Tailwind, Text } from '@react-email/components';

interface UserRegisterEmailProps {
  name: string;
}

export const UserRegisterEmail = ({ name }: UserRegisterEmailProps): React.ReactNode => {
  return (
    <Html lang="en">
      <Head />
      <Tailwind>
        <Body className="bg-[#f4f4f5] font-sans">
          <Container className="max-w-[480px] my-10 mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header with gradient */}
            <Section className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-8 py-10 text-center">
              <Text className="text-[48px] m-0">✓</Text>
              <Heading className="text-white text-[24px] font-bold m-0 mt-2">Registration Confirmed!</Heading>
            </Section>

            {/* Content */}
            <Section className="px-8 py-8">
              <Text className="text-[#374151] text-[16px] leading-[1.6] m-0">
                Hello <strong>{name}</strong>,
              </Text>
              <Text className="text-[#374151] text-[16px] leading-[1.6] mt-4">
                Welcome aboard! Your account has been successfully created. We&apos;re excited to have you with us.
              </Text>
              <Text className="text-[#374151] text-[16px] leading-[1.6] mt-4">
                You can now log in and start exploring all the features we have to offer.
              </Text>

              <Hr className="border-[#e5e7eb] my-6" />

              <Text className="text-[#6b7280] text-[14px] leading-[1.6] m-0">
                If you didn&apos;t create this account, please ignore this email or{' '}
                <Link href="#" className="text-[#6366f1] underline">
                  contact our support
                </Link>
                .
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-[#f9fafb] px-8 py-6 text-center">
              <Text className="text-[#9ca3af] text-[12px] m-0">© 2026 Your Company. All rights reserved.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

import * as React from 'react';
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface UserRegisterEmailProps {
  code: string;
  date: string;
}

export const UserRegisterEmail = ({ code, date }: UserRegisterEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#efeef1]">
          <Preview>You updated the password for your account</Preview>
          <Container className="max-w-[580px] my-[30px] mx-auto bg-white">
            <Section className="w-full">
              <Row>
                <Column className="[border-bottom:1px_solid_rgb(238,238,238)] w-[249px]" />
                <Column className="[border-bottom:1px_solid_rgb(145,71,255)] w-[102px]" />
                <Column className="[border-bottom:1px_solid_rgb(238,238,238)] w-[249px]" />
              </Row>
            </Section>
            <Section className="pt-[5px] px-5 pb-[10px]">
              <Text className="text-[14px] leading-[1.5]">Hi,</Text>
              <Text className="text-[14px] leading-[1.5]">
                You registered on our service on {date}. If this was you, then no further action is required.
              </Text>
              <Text className="text-[14px] leading-[1.5]">Here your OTP code {code}</Text>
              <Text className="text-[14px] leading-[1.5]">However if you did NOT perform this, skip this email.</Text>
              <Text className="text-[14px] leading-[1.5]">
                Still have questions? Please contact{' '}
                <Link href="#" className="underline">
                  Our Support
                </Link>
              </Text>
              <Text className="text-[14px] leading-[1.5]">
                Thanks,
                <br />
                Ivan Azis
              </Text>
            </Section>
          </Container>

          <Section className="max-w-[580px] mx-auto">
            <Row>
              <Text className="text-center text-[#706a7b]">© 2026 Ivan, All Rights Reserved</Text>
            </Row>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
};

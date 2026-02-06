import { IsEmail, IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class SendEmailDto {
  @IsEmail({}, { message: 'El email proporcionado no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  to: string;

  @IsString({ message: 'El template debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El template es requerido' })
  template: string;

  @IsObject({ message: 'Los datos deben ser un objeto' })
  @IsOptional()
  data?: Record<string, any>;
}

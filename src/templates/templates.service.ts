import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';

@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.templateRepository.count();
    if (count === 0) {
      await this.templateRepository.save({
        slug: 'password_recovery',
        name: 'Recuperación de Clave',
        filename: 'password-recovery',
        subject: 'Restablece tu contraseña',
        isActive: true,
      });
    }
  }

  async findBySlug(slug: string): Promise<Template | null> {
    return this.templateRepository.findOne({ where: { slug, isActive: true } });
  }
}

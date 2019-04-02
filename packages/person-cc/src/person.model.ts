import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Attribute extends ConvectorModel<Attribute>{
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.attribute';

  @Required()
  @ReadOnly()
  @Validate(yup.string())
  public name: string;

  @Required()
  public content: any;

  @Required()
  @ReadOnly()
  @Validate(yup.date())
  public issuedDate: Date;

  public expiresDate: Date;

  @Default(false)
  @Validate(yup.boolean())
  public expired: boolean;

  @Required()
  @Validate(yup.string())
  public certifierID: string;
}

export class Person extends ConvectorModel<Person> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.person';

  @Required()
  @Validate(yup.string())
  public name: string;

  @Validate(yup.array(Attribute.schema()))
  public attributes: Array<Attribute>;
}


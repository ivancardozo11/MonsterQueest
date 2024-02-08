/* eslint-disable dot-notation */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate (context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context);
        const request = ctx.getContext().req;

        const apiKey = request.headers['authorization'];
        if (apiKey === process.env.CEO_API_KEY) {
            request.user = { role: 'CEO' };
        } else if (apiKey === process.env.BORED_MIKE_API_KEY) {
            request.user = { role: 'BoredMike' };
        } else if (apiKey === process.env.EMPLOYEE_API_KEY) {
            request.user = { role: 'Employee' };
        } else {
            throw new UnauthorizedException('Unauthorized access');
        }

        return true;
    }
}

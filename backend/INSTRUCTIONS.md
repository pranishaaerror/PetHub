## TODO

1. User lae login garae pachi admin dashboard ma pathaunae navigate garaera
1. express authentication middleware banaunae to verify token 
    - request ko header bata authentication ma token huncha Bearer <token> bhanaera tyo <token> firebase ma verify garnae
    - ani user ko uid,email haru Claims ma aaucha tyo req.user = {uid,email} bhanaera rakhnae
1. Backend ma /auth/me api end point banaunae
    - aghi auth middleware ma req.user ma rakhaeko kura access garnae
    - tyo uid use garaera firebase bata tyo user ko detail get garnae,
    - tyo aayaeko user detail lai hamro database ma save garnae

1. sabai api endpoint ma tyo authentication middleware rakhnae
    - ani matra api endpoint ma







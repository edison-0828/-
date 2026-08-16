package vip.xiaonuo.zj.modular.user.param;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ZjIdentitySubmitParam {
    @NotBlank(message = "真实姓名不能为空")
    private String realName;
    @NotBlank(message = "身份证号不能为空")
    @Pattern(regexp = "(^\\d{15}$)|(^\\d{17}[0-9Xx]$)", message = "身份证号格式不正确")
    private String idCardNumber;
    @NotBlank(message = "身份证人像面不能为空")
    private String identityFrontUrl;
    @NotBlank(message = "身份证国徽面不能为空")
    private String identityBackUrl;
}

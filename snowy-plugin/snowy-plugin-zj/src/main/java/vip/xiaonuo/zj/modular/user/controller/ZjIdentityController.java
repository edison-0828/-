package vip.xiaonuo.zj.modular.user.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vip.xiaonuo.auth.core.annotation.SaClientCheckLogin;
import vip.xiaonuo.common.pojo.CommonResult;
import vip.xiaonuo.zj.modular.user.entity.ZjUserProfile;
import vip.xiaonuo.zj.modular.user.param.ZjIdentityReviewParam;
import vip.xiaonuo.zj.modular.user.param.ZjIdentitySubmitParam;
import vip.xiaonuo.zj.modular.user.service.ZjIdentityService;

@Tag(name = "租迹实名认证")
@RestController
@RequestMapping("/api/zj/identity")
public class ZjIdentityController {

    @Resource
    private ZjIdentityService identityService;

    @Operation(summary = "当前用户实名认证状态")
    @SaClientCheckLogin
    @GetMapping
    public CommonResult<ZjUserProfile> current() {
        return CommonResult.data(identityService.current());
    }

    @Operation(summary = "提交实名认证")
    @SaClientCheckLogin
    @PostMapping
    public CommonResult<String> submit(@RequestBody @Valid ZjIdentitySubmitParam param) {
        identityService.submit(param);
        return CommonResult.ok();
    }

    @Operation(summary = "后台审核实名认证")
    @SaCheckPermission("/zj/identity/review")
    @PostMapping("/review")
    public CommonResult<String> review(@RequestBody @Valid ZjIdentityReviewParam param) {
        identityService.review(param);
        return CommonResult.ok();
    }
}

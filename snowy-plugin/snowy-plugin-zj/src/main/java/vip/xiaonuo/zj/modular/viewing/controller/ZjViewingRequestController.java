package vip.xiaonuo.zj.modular.viewing.controller;

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
import vip.xiaonuo.zj.modular.viewing.entity.ZjViewingRequest;
import vip.xiaonuo.zj.modular.viewing.param.ZjViewingCreateParam;
import vip.xiaonuo.zj.modular.viewing.service.ZjViewingRequestService;

import java.util.List;

@Tag(name = "租迹看房预约")
@RestController
@RequestMapping("/api/zj/viewings")
@SaClientCheckLogin
public class ZjViewingRequestController {

    @Resource
    private ZjViewingRequestService viewingRequestService;

    @Operation(summary = "提交看房预约")
    @PostMapping
    public CommonResult<String> create(@RequestBody @Valid ZjViewingCreateParam param) {
        return CommonResult.data(viewingRequestService.create(param));
    }

    @Operation(summary = "我的看房预约")
    @GetMapping
    public CommonResult<List<ZjViewingRequest>> mine() {
        return CommonResult.data(viewingRequestService.mine());
    }
}

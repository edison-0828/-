package vip.xiaonuo.zj.modular.listing.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vip.xiaonuo.auth.core.annotation.SaClientCheckLogin;
import vip.xiaonuo.common.pojo.CommonResult;
import vip.xiaonuo.zj.modular.listing.entity.ZjListingEvidence;
import vip.xiaonuo.zj.modular.listing.param.ZjListingEvidenceSubmitParam;
import vip.xiaonuo.zj.modular.listing.service.ZjListingEvidenceService;

import java.util.List;

@Tag(name = "租迹房源证明")
@RestController
@Validated
@RequestMapping("/api/zj/listing-evidence")
@SaClientCheckLogin
public class ZjListingEvidenceController {

    @Resource
    private ZjListingEvidenceService evidenceService;

    @Operation(summary = "提交合同与租金证明")
    @PostMapping
    public CommonResult<String> submit(@RequestBody @Valid ZjListingEvidenceSubmitParam param) {
        evidenceService.submit(param);
        return CommonResult.ok();
    }

    @Operation(summary = "查看自己房源的证明材料")
    @GetMapping
    public CommonResult<List<ZjListingEvidence>> mine(@RequestParam @NotBlank String listingId) {
        return CommonResult.data(evidenceService.mine(listingId));
    }
}
